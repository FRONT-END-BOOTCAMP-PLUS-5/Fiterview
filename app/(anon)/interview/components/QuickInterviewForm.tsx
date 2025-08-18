'use client';

import axios from 'axios';
import { useState } from 'react';
import UploadOptions from './UploadOptions';
import UploadedFiles from './UploadedFiles';
import GenerateQuestionModal from './GenerateQuestionModal';
import LoginModal from '../../components/LoginModal';
import FileAnalysisErrorModal from './FileAnalysisErrorModal';
import { useModalStore } from '@/stores/useModalStore';
import Sparkles from '@/public/assets/icons/sparkles.svg';
import { useReportStore } from '@/stores/useReportStore';

type SourceType = 'portfolio' | 'job';
type UploadedItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  source: SourceType;
  file: File;
};

export default function QuickInterviewForm() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedItem[]>([]);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState<'generateQuestion' | 'login' | 'fileError' | null>(
    null
  );
  const { openModal } = useModalStore();
  const { reportId, setReportId } = useReportStore();

  const handleAddFiles = (files: File[], source: SourceType) => {
    setUploadedFiles((prev) => {
      const getFileKey = (file: File) =>
        `${file.name}:${file.size}:${file.type}:${(file as any).lastModified ?? ''}`;
      const existingKeys = new Set(prev.map((p) => getFileKey(p.file)));

      const dedupedNew = files.filter((f) => !existingKeys.has(getFileKey(f)));

      const remainingSlots = Math.max(0, 6 - prev.length);
      const toAdd = dedupedNew.slice(0, remainingSlots).map((f) => ({
        id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        size: f.size,
        type: f.type,
        source,
        file: f,
      }));

      const attemptedOverflow = dedupedNew.length > remainingSlots;
      setLimitExceeded(attemptedOverflow);

      return [...prev, ...toAdd];
    });
  };

  const submitFiles = async () => {
    if (uploadedFiles.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      uploadedFiles.forEach((item) => {
        formData.append('files', item.file, item.name);
      });

      const response = await axios.post('/api/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setUploadedFiles([]);
        setLimitExceeded(false);
        setReportId(response.data.reportId);
        setModalType('generateQuestion');

        openModal();
      }
    } catch (error) {
      console.error('면접 생성 실패:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setModalType('login');
          openModal();
        } else if (error.response?.status === 403) {
          alert('권한이 없습니다.');
        } else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || '파일 분석에 실패했습니다.';
          if (errorMessage.includes('JSON 응답을 찾을 수 없습니다')) {
            setModalType('fileError');
            openModal();
          } else {
            alert(errorMessage);
          }
        } else {
          alert(error.response?.data?.message || '면접 생성에 실패했습니다.');
        }
      } else {
        alert('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex-1 inline-flex flex-col h-full">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="justify-start text-slate-800 text-3xl font-semibold">빠른 AI 면접</h2>
        <p className="text-slate-500 text-sm">포트폴리오나 채용공고를 업로드해보세요.</p>
      </div>

      <UploadOptions onAddFiles={handleAddFiles} />

      <div className="flex flex-col h-full">
        <UploadedFiles
          files={uploadedFiles}
          limitExceeded={limitExceeded}
          onRemove={(id) => {
            setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
            setLimitExceeded(false);
          }}
        />

        <button
          className={`w-full h-12 py-[14px] rounded-xl flex justify-center items-center gap-3 mt-6 ${
            uploadedFiles.length === 0 || isSubmitting
              ? 'bg-slate-100 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={submitFiles}
          disabled={uploadedFiles.length === 0 || isSubmitting}
        >
          <Sparkles
            width={20}
            height={20}
            strokeWidth={1.67}
            stroke={uploadedFiles.length === 0 || isSubmitting ? '#CBD5E1' : '#ffffff'}
          />
          <p
            className={`justify-start text-base font-semibold ${
              uploadedFiles.length === 0 || isSubmitting ? 'text-slate-400' : 'text-white'
            }`}
          >
            {isSubmitting ? '면접 질문 생성 중...' : '맞춤 면접 질문 생성하기'}
          </p>
        </button>
      </div>
      {modalType === 'generateQuestion' && reportId && <GenerateQuestionModal />}
      {modalType === 'login' && <LoginModal />}
      {modalType === 'fileError' && <FileAnalysisErrorModal />}
    </section>
  );
}
