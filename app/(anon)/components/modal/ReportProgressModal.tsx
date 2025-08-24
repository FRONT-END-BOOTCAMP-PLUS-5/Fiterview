'use client';

import { useEffect, useMemo } from 'react';
import Modal from '@/app/(anon)/components/modal/Modal';
import ModalOverlay from '@/app/(anon)/components/modal/ModalOverlay';
import { useModalStore } from '@/stores/useModalStore';
import { useReportStore } from '@/stores/useReportStore';
import { LoadingSpinner } from '@/app/(anon)/components/loading/LoadingSpinner';
import ProgressBar from '@/app/(anon)/components/loading/ProgressBar';
import { useReportProgress } from '@/hooks/useReportProgress';
import { ProgressStep } from '@/types/progress';
import { STORAGE_KEYS } from '@/constants/progress';

type Step = ProgressStep;

export default function ReportProgressModal() {
  const { isOpen, currentStep, closeModal, replaceModal, openModal } = useModalStore();
  const { jobId, reportId, setReportId, setJobId, onReportCompleted } = useReportStore();

  // 마운트 시 작업 ID 복구
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEYS.FITERVIEW_JOB_ID);
    if (stored && !jobId) {
      setJobId(stored);
      if (!isOpen || currentStep !== 'reportProgress') {
        openModal('reportProgress');
      }
    }
  }, [jobId, setJobId, isOpen, currentStep, openModal]);

  const persistKey = useMemo(
    () => `${isOpen && currentStep === 'reportProgress'}:${jobId ?? ''}`,
    [isOpen, currentStep, jobId]
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sepIndex = persistKey.indexOf(':');
    const activeStr = sepIndex >= 0 ? persistKey.slice(0, sepIndex) : 'false';
    const job = sepIndex >= 0 ? persistKey.slice(sepIndex + 1) : '';
    if (activeStr === 'true' && job) {
      window.localStorage.setItem(STORAGE_KEYS.FITERVIEW_JOB_ID, job);
    }
  }, [persistKey]);

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
        window.localStorage.removeItem(STORAGE_KEYS.FITERVIEW_JOB_ID);
      }
      remove();
    }
    if (step === 'completed') {
      // 리포트 생성 완료 시 콜백 호출
      if (onReportCompleted) {
        onReportCompleted();
      }
      replaceModal('generateQuestion');
    }
    if (step === 'error') {
      replaceModal('questionError');
    }
  }, [
    step,
    serverReportId,
    reportId,
    setReportId,
    cancel,
    remove,
    replaceModal,
    onReportCompleted,
  ]);

  const handleClose = () => {
    cancel();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEYS.FITERVIEW_JOB_ID);
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
        size="medium"
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
      <ProgressBar percent={getPercent(step)} showWalker={true} className="pt-1" />
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
    'generating',
    'creating_report',
    'saving_questions',
    'completed',
  ];
  if (!step) return 0;
  const idx = order.indexOf(step);
  if (idx < 0) return 0;
  return Math.round((idx / (order.length - 1)) * 100);
}
