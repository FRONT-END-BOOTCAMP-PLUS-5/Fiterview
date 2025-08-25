'use client';

import axios from 'axios';
import { motion } from 'framer-motion';
import { useUploadFiles } from '@/hooks/useUploadFiles';
import { useState, useEffect } from 'react';
import { useModalStore } from '@/stores/useModalStore';
import { useReportStore } from '@/stores/useReportStore';
import UploadOptions from '@/app/(anon)/interview/components/UploadOptions';
import UploadedFiles from '@/app/(anon)/interview/components/UploadedFiles';
import ErrorModal from '@/app/(anon)/components/modal/ErrorModal';
import GenerateQuestionModal from '@/app/(anon)/components/modal/GenerateQuestionModal';
import Sparkles from '@/public/assets/icons/sparkles.svg';

interface QuickInterviewFormProps {
  onReportCreated?: () => void;
  onReportCompleted?: () => void;
  LoginModal?: React.ReactNode;
}

export default function QuickInterviewForm({
  onReportCreated,
  onReportCompleted,
  LoginModal,
}: QuickInterviewFormProps) {
  const {
    uploadedFiles,
    limitExceeded,
    handleAddFiles,
    handleRemoveFile,
    setUploadedFiles,
    setLimitExceeded,
  } = useUploadFiles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openModal, currentStep, isOpen } = useModalStore();
  const { reportId, setReportId, setJobId, setOnReportCompleted } = useReportStore();

  useEffect(() => {
    if (onReportCompleted) {
      setOnReportCompleted(onReportCompleted);
    }
    return () => {
      setOnReportCompleted(() => {});
    };
  }, [onReportCompleted, setOnReportCompleted]);

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
        const { reportId: newReportId, jobId } = response.data.data || {};
        if (newReportId) setReportId(String(newReportId));
        if (jobId) {
          setJobId(String(jobId));
        }
        if (onReportCreated) {
          onReportCreated();
        }
        openModal('reportProgress');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          openModal('login');
        } else if (error.response?.status === 403) {
          alert('권한이 없습니다.');
        } else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || '파일 분석에 실패했습니다.';
          if (errorMessage.includes('JSON 응답을 찾을 수 없습니다')) {
            openModal('fileError');
          } else {
            alert(errorMessage);
          }
        } else {
          openModal('questionError');
        }
      } else {
        alert('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex-1 inline-flex flex-col">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="justify-start text-[#1E293B] text-[20px] font-semibold">빠른 AI 면접</h2>
      </div>

      <UploadOptions onAddFiles={handleAddFiles} />

      <div className="h-full self-stretch flex flex-col justify-start items-start gap-4 mt-10">
        <UploadedFiles
          files={uploadedFiles}
          limitExceeded={limitExceeded}
          onRemove={handleRemoveFile}
        />

        <motion.button
          className={`mt-6 w-full h-12 py-[14px] rounded-xl flex justify-center items-center gap-3 ${
            uploadedFiles.length === 0 || isSubmitting
              ? 'bg-slate-100 cursor-not-allowed'
              : 'bg-[#3B82F6] cursor-pointer'
          }`}
          onClick={submitFiles}
          disabled={uploadedFiles.length === 0 || isSubmitting}
          whileHover={
            uploadedFiles.length > 0 && !isSubmitting
              ? {
                  scale: 1.02,
                }
              : undefined
          }
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
        </motion.button>
      </div>

      {LoginModal}
      {isOpen && currentStep === 'fileError' && (
        <ErrorModal subTitle="업로드된 파일의 내용으로는 적절한 면접 질문을 생성하기 어렵습니다." />
      )}
      {isOpen && currentStep === 'questionError' && (
        <ErrorModal subTitle="면접 질문 생성에 실패했습니다. 다시 시도해주세요." />
      )}
      {isOpen && currentStep === 'generateQuestion' && <GenerateQuestionModal />}
    </section>
  );
}
