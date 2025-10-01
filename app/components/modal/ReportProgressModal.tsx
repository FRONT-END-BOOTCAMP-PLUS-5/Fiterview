'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProgressStep } from '@/types/progress';
import { useReportProgress } from '@/hooks/useReportProgress';
import { useModalStore } from '@/stores/useModalStore';
import { useReportStore } from '@/stores/useReportStore';
import { getCopy, getPercent } from '@/lib/progress/progressStepInfo';
import { LoadingSpinner } from '@/app/components/loading/LoadingSpinner';
import ProgressBar from '@/app/components/loading/ProgressBar';
import Modal from '@/app/components/modal/Modal';
import ModalOverlay from '@/app/components/modal/ModalOverlay';
import { STORAGE_KEYS } from '@/constants/progress';

type Step = ProgressStep;

export default function ReportProgressModal() {
  const { isOpen, currentStep, closeModal, replaceModal, openModal } = useModalStore();
  const { jobId, reportId, setReportId, setJobId, clearJobId, onReportCompleted } =
    useReportStore();
  const [sampleMessageIndex, setSampleMessageIndex] = useState(0);

  const { step, serverReportId, cancel, remove } = useReportProgress({
    enabled: isOpen && currentStep === 'reportProgress' && (!!jobId || !!reportId),
    jobId,
    reportId,
    onJobIdClear: () => clearJobId(),
  });

  //새로고침/재진입 시 jobId 복구
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const shouldRestore = !isOpen || currentStep !== 'reportProgress';
    if ((!jobId || jobId.length === 0) && shouldRestore) {
      const stored = window.localStorage.getItem(STORAGE_KEYS.FITERVIEW_JOB_ID);
      if (stored) {
        setJobId(stored);
        openModal('reportProgress');
      }
    }
  }, [jobId, isOpen, currentStep, setJobId, replaceModal]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (jobId && jobId.length > 0) {
      window.localStorage.setItem(STORAGE_KEYS.FITERVIEW_JOB_ID, jobId);
    }
  }, [jobId]);

  useEffect(() => {
    if (step === 'generating') {
      const interval = setInterval(() => {
        setSampleMessageIndex((prev) => (prev + 1) % 3);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setSampleMessageIndex(0);
    }
  }, [step]);

  useEffect(() => {
    if (serverReportId && !reportId) {
      setReportId(String(serverReportId));
    }
    if (step === 'completed') {
      cancel();
      clearJobId();
      remove();
      onReportCompleted?.();
      replaceModal('generateQuestion');
    } else if (step === 'error') {
      cancel();
      clearJobId();
      remove();
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
    clearJobId();
    closeModal();
  };

  const { title, description, icon } = useMemo(
    () => getCopy(step, sampleMessageIndex),
    [step, sampleMessageIndex]
  );

  return (
    <ModalOverlay
      isOpen={isOpen && currentStep === 'reportProgress'}
      onClose={handleClose}
      closeOnBackClick={false}
    >
      <Modal
        title={
          <div className="flex items-center gap-2 mb-1.5">
            <div className="text-[15px] flex items-center justify-center w-8 h-8 rounded-full bg-[#E2E8F0] text-white">
              {icon}
            </div>
            <span className="text-lg font-semibold">{title}</span>
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
        body={<ModalBody step={step} />}
      />
    </ModalOverlay>
  );
}

function ModalBody({ step }: { step?: Step }) {
  return (
    <div className="self-stretch inline-flex flex-col items-stretch gap-6 w-full mt-2">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative w-full ">
          <ProgressBar percent={getPercent(step)} showWalker={true} />
        </div>
      </div>
    </div>
  );
}
