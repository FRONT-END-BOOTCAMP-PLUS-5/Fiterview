'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api/axiosInstance';
import { useUploadFiles } from '@/hooks/useUploadFiles';
import { useDragAndPasteUpload } from '@/hooks/useDragAndPasteUpload';
import { useModalStore } from '@/stores/useModalStore';
import { useReportStore } from '@/stores/useReportStore';
import { useSessionUser } from '@/lib/auth/useSessionUser';
import ErrorModal from '@/app/components/modal/ErrorModal';
import LoginModal from '@/app/components/modal/LoginModal';
import GenerateQuestionModal from '@/app/components/modal/GenerateQuestionModal';
import { NoneFiles } from '@/app/components/question/NoneFiles';
import FileItem from '@/app/components/question/FileItem';
import FilesList from '@/app/components/question/FilesList';
import FilesOptions from '@/app/components/question/FilesOptions';
import { QuickInterviewFormProps } from '@/types/file';
import Sparkles from '@/public/assets/icons/sparkles.svg';

export default function InterviewForm({
  onReportCreated,
  onReportCompleted,
}: QuickInterviewFormProps) {
  const {
    uploadedFiles,
    limitExceeded,
    handleAddFiles,
    handleRemoveFile,
    setUploadedFiles,
    setLimitExceeded,
  } = useUploadFiles();

  const { containerDragProps, isDragging } = useDragAndPasteUpload(handleAddFiles);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openModal, currentStep, isOpen } = useModalStore();
  const { setReportId, setJobId, setOnReportCompleted, clearReportId, clearJobId } =
    useReportStore();
  const { user } = useSessionUser();

  const gridClass =
    uploadedFiles.length === 1
      ? 'grid grid-cols-1 gap-2 w-full h-full'
      : 'grid grid-cols-2 gap-2 w-full h-full';

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

    if (!user) {
      openModal('login');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      uploadedFiles.forEach((item) => {
        formData.append('files', item.file, item.name);
      });

      clearReportId();
      clearJobId();

      const response = await apiClient.post('/api/reports', formData);

      if (response.data.success) {
        setUploadedFiles([]);
        setLimitExceeded(false);
        const { reportId: newReportId, jobId } = response.data.data || {};

        if (newReportId) {
          setReportId(String(newReportId));
        }
        if (jobId) {
          setJobId(String(jobId));
        }
        if (onReportCreated) {
          onReportCreated();
        }
        openModal('reportProgress');
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex-1 inline-flex flex-col h-full gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="justify-start text-[#1E293B] text-[20px] font-semibold">빠른 AI 면접</h2>
      </div>

      <FilesOptions onAddFiles={handleAddFiles} />

      <div className="min-h-[227px] self-stretch flex flex-col justify-between items-start">
        <div
          {...containerDragProps}
          className={`relative w-full ${
            isDragging ? 'bg-slate-100 border-2 border-dashed border-[#3B82F6] rounded-xl' : ''
          }`}
          title="파일을 드래그하거나 클립보드에서 붙여넣기(Ctrl+V)하세요."
        >
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 bg-opacity-90 rounded-xl">
              <p className="text-blue-500 font-medium">파일을 여기에 놓으세요</p>
            </div>
          )}
          <FilesList
            files={uploadedFiles}
            onRemove={handleRemoveFile}
            maxFileLength={32}
            limitExceeded={limitExceeded}
            emptyComponent={<NoneFiles iconSize={32} gapSize={2} iconBgSize={14} />}
            fileItemComponent={FileItem}
            noneContainerClass="self-stretch flex flex-col justify-start items-start gap-2 h-[147px]"
            containerClass={gridClass}
            warningClass="text-start text-red-500 text-xs pl-1 col-span-2"
          />
        </div>

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

      {isOpen && currentStep === 'fileError' && (
        <ErrorModal subTitle="업로드된 파일의 내용으로는 적절한 면접 질문을 생성하기 어렵습니다." />
      )}
      {isOpen && currentStep === 'questionError' && (
        <ErrorModal subTitle="면접 질문 생성에 실패했습니다. 다시 시도해주세요." />
      )}
      {isOpen && currentStep === 'generateQuestion' && <GenerateQuestionModal />}
      {isOpen && currentStep === 'login' && <LoginModal />}
    </section>
  );
}
