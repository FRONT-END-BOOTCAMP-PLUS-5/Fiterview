'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '@/app/(anon)/components/modal/Modal';
import ModalOverlay from '@/app/(anon)/components/modal/ModalOverlay';
import { useModalStore } from '@/stores/useModalStore';
import { useReportStore } from '@/stores/useReportStore';
import { LoadingSpinner } from '@/app/(anon)/components/loading/LoadingSpinner';
import ProgressBar from '@/app/(anon)/components/loading/ProgressBar';
import { useReportProgress } from '@/hooks/useReportProgress';

type Step =
  | 'started'
  | 'extracting'
  | 'generating'
  | 'creating_report'
  | 'saving_questions'
  | 'completed'
  | 'error';

export default function ReportProgressModal() {
  const { isOpen, currentStep, closeModal, replaceModal, openModal } = useModalStore();
  const { jobId, reportId, setReportId, setJobId } = useReportStore();
  const queryClient = useQueryClient();

  // 마운트 시 작업 ID 복구
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('fiterview_job_id');
    if (stored && !jobId) {
      setJobId(stored);
      if (!isOpen || currentStep !== 'reportProgress') {
        openModal('reportProgress');
      }
    }
  }, [jobId, setJobId, isOpen, currentStep, openModal]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (jobId) {
      window.localStorage.setItem('fiterview_job_id', jobId);
    }
  }, [jobId]);

  // 요청 중복 제거
  const pollingKey = useMemo(() => ['report-progress', jobId, reportId], [jobId, reportId]);

  // 서버 진행 상태
  const { data, isFetching, step, serverReportId, errorMessage, cancel, remove } =
    useReportProgress({
      enabled: isOpen && currentStep === 'reportProgress' && (!!jobId || !!reportId),
      jobId,
      reportId,
    });

  useEffect(() => {
    if (serverReportId && !reportId) {
      setReportId(String(serverReportId));
    }
    if (step === 'completed' || step === 'error') {
      cancel();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('fiterview_job_id');
      }
      remove();
    }
    if (step === 'completed') {
      replaceModal('generateQuestion');
    }
  }, [step, serverReportId, reportId, setReportId, cancel, remove, replaceModal]);

  const handleClose = () => {
    cancel();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('fiterview_job_id');
    }
    closeModal();
  };

  const { title, description } = useMemo(() => getCopy(step), [step]);

  return (
    <ModalOverlay
      isOpen={isOpen && currentStep === 'reportProgress'}
      onClose={handleClose}
      closeOnBackClick={false}
    >
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {step !== 'completed' && step !== 'error' && (
              <span className="inline-flex items-center">
                <LoadingSpinner size="small" />
              </span>
            )}
          </div>
        }
        subTitle={description}
        onClose={handleClose}
        hideX={true}
        body={<ModalBody step={step} errorMessage={errorMessage} />}
      />
    </ModalOverlay>
  );
}

function ModalBody({ step, errorMessage }: { step?: Step; errorMessage?: string }) {
  return (
    <div className="self-stretch inline-flex flex-col items-stretch gap-4">
      <ProgressBar percent={getPercent(step)} showWalker={true} />
      {step === 'error' && (
        <p className="text-sm text-red-600">
          {errorMessage ?? '오류가 발생했습니다. 다시 시도해주세요.'}
        </p>
      )}
    </div>
  );
}

function getCopy(step?: Step): { title: string; description: string } {
  switch (step) {
    case 'started':
      return { title: '분석 준비 중', description: '업로드한 파일을 확인하고 있어요.' };
    case 'extracting':
      return { title: '파일 분석 중', description: '문서에서 주요 정보를 추출하고 있어요.' };
    case 'generating':
      return { title: '질문 생성 중', description: 'AI가 맞춤 질문을 생성하고 있어요.' };
    case 'creating_report':
      return { title: '리포트 생성 중', description: '리포트를 만드는 중이에요.' };
    case 'saving_questions':
      return { title: '질문 저장 중', description: '생성된 질문을 저장하고 있어요.' };
    case 'error':
      return { title: '오류 발생', description: '생성 중 문제가 발생했어요.' };
    default:
      return { title: '진행 중', description: '잠시만 기다려주세요.' };
  }
}

function getPercent(step?: Step): number {
  const order: Step[] = [
    'started',
    'extracting',
    'creating_report',
    'generating',
    'saving_questions',
    'completed',
  ];
  if (!step) return 0;
  const idx = order.indexOf(step);
  if (idx < 0) return 0;
  return Math.round((idx / (order.length - 1)) * 100);
}
