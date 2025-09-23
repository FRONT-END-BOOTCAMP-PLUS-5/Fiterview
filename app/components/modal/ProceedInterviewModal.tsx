'use client';

import Modal from '@/app/components/modal/Modal';
import ModalOverlay from '@/app/components/modal/ModalOverlay';
import Proceed from '@/public/assets/icons/proceed.svg';

interface ProceedInterviewModalProps {
  isOpen: boolean;
  currentOrder: number;
  onClose: () => void;
  onProceed: () => void;
  onRestart: () => void | Promise<void>;
}

export default function ProceedInterviewModal({
  isOpen,
  currentOrder,
  onClose,
  onProceed,
  onRestart,
}: ProceedInterviewModalProps) {
  if (!isOpen) return null;

  const Body = (
    <div className="flex flex-col gap-[16px] items-center">
      <div className="w-[64px] h-[64px] bg-[#E2E8F0] rounded-[32px] flex items-center justify-center">
        <Proceed width={40} height={40} strokeWidth={3.5} stroke="#3B82F6" />
      </div>
      <p className="text-[#1E293B] font-semibold">
        {currentOrder + 1}번 질문부터 진행할 수 있어요.
      </p>
    </div>
  );
  const Buttons = (
    <div className="self-stretch inline-flex justify-center items-center gap-3">
      <button
        className="flex-1 h-11 px-5 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-[#CBD5E1] flex justify-center items-center cursor-pointer"
        onClick={onRestart}
      >
        <p className="text-[#64748B] text-sm font-semibold">처음부터 시작하기</p>
      </button>
      <button
        className="flex-1 h-11 px-5 bg-[#3B82F6] rounded-lg flex justify-center items-center cursor-pointer"
        onClick={onProceed}
      >
        <p className="text-white text-sm font-semibold">이어서 진행하기</p>
      </button>
    </div>
  );

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <Modal
        size="medium"
        title="이전에 진행했던 면접이네요."
        subTitle="1번부터 다시 시작하거나, 이어서 진행할 수 있어요."
        onClose={onClose}
        body={Body}
        buttons={Buttons}
      />
    </ModalOverlay>
  );
}
