'use client';

import Modal from '@/app/components/modal/Modal';
import ModalOverlay from '@/app/components/modal/ModalOverlay';

interface ProceedInterviewModalProps {
  isOpen: boolean;
  currentOrder: number;
  onClose: () => void;
  onResume: () => void;
  onRestart: () => void | Promise<void>;
}

export default function ProceedInterviewModal({
  isOpen,
  currentOrder,
  onClose,
  onResume,
  onRestart,
}: ProceedInterviewModalProps) {
  if (!isOpen) return null;

  const Body = (
    <div className="w-[480px] p-4 flex flex-col gap-4">
      <p className="text-slate-700 text-sm">
        이전에 {currentOrder}번 질문까지 진행했어요. 계속 이어서 진행할까요?
      </p>
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 rounded-md bg-slate-100 text-slate-700" onClick={onClose}>
          취소
        </button>
        <button className="px-4 py-2 rounded-md bg-slate-200 text-slate-800" onClick={onRestart}>
          처음부터
        </button>
        <button className="px-4 py-2 rounded-md bg-blue-600 text-white" onClick={onResume}>
          이어서 진행
        </button>
      </div>
    </div>
  );

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <Modal
        size="small"
        title="면접 이어서 진행"
        subTitle="중단된 면접을 이어서 진행할 수 있어요"
        onClose={onClose}
        body={Body}
      />
    </ModalOverlay>
  );
}
