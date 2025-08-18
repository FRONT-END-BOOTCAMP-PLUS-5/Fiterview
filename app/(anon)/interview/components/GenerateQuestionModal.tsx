'use client';
import Modal from '../../components/Modal';
import Check from '@/public/assets/icons/check-circle.svg';
import ModalOverlay from '../../components/ModalOverlay';
import { useModalStore } from '@/stores/useModalStore';

export default function GenerateQuestionModal({ reportId }: { reportId: string | null }) {
  const { isOpen, closeModal } = useModalStore();

  return (
    <ModalOverlay isOpen={isOpen} onClose={closeModal}>
      <Modal
        title="질문지가 생성되었어요!"
        subTitle="포트폴리오를 기반으로 10개의 질문이 생성되었어요."
        onClose={closeModal}
        body={<ModalBody />}
        buttons={<ModalButtons onClose={closeModal} reportId={reportId} />}
      />
    </ModalOverlay>
  );
}

function ModalBody() {
  return (
    <div className="self-stretch inline-flex flex-col items-start gap-4">
      <div className="self-stretch inline-flex justify-center items-center">
        <div className="w-16 h-16 relative bg-slate-200 rounded-[32px] flex justify-center items-center">
          <Check width={32} height={32} stroke="#3B82F6" strokeWidth={2.67} />
        </div>
      </div>
      <div className="self-stretch flex flex-col items-start gap-3">
        <div className="self-stretch text-center text-slate-800 text-base font-semibold">
          지금 당장 면접을 볼 수 있어요.
        </div>
        <div className="self-stretch text-center text-slate-500 text-sm">
          면접은 총 10분 예정이며, 중간에 나가면 저장되지 않아요.
        </div>
      </div>
    </div>
  );
}

function ModalButtons({ onClose, reportId }: { onClose: () => void; reportId: string | null }) {
  return (
    <div className="self-stretch inline-flex justify-center items-center gap-3">
      <div
        className="flex-1 h-11 px-5 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-[#CBD5E1] flex justify-center items-center cursor-pointer"
        onClick={() => {
          onClose();
          if (reportId) {
            window.location.href = `/reports/${reportId}`;
          }
        }}
      >
        <div className="text-[#64748B] text-sm font-semibold">질문지만 볼래요</div>
      </div>
      <div
        className="flex-1 h-11 px-5 bg-[#3B82F6] rounded-lg flex justify-center items-center cursor-pointer"
        onClick={() => {
          onClose();
          if (reportId) {
            window.location.href = `/interview/${reportId}`;
          }
        }}
      >
        <div className="text-white text-sm font-semibold">면접장으로 이동하기</div>
      </div>
    </div>
  );
}
