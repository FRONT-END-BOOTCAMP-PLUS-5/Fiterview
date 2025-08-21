'use client';
import { useRouter } from 'next/navigation';
import { useModalStore } from '@/stores/useModalStore';
import { useReportStore } from '@/stores/useReportStore';
import Modal from '@/app/(anon)/components/modal/Modal';
import ModalOverlay from '@/app/(anon)/components/modal/ModalOverlay';
import Check from '@/public/assets/icons/check-circle.svg';

export default function GenerateQuestionModal() {
  const { isOpen, closeModal } = useModalStore();
  const router = useRouter();
  const { reportId } = useReportStore();

  const ModalButtons = () => {
    return (
      <div className="self-stretch inline-flex justify-center items-center gap-3">
        <button
          className="flex-1 h-11 px-5 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-[#CBD5E1] flex justify-center items-center cursor-pointer"
          onClick={() => {
            console.log('질문지만 볼래요 클릭, reportId:', reportId);
            closeModal();
            if (reportId) {
              console.log('router.push 호출:', `/reports/${reportId}`);
              router.push(`/reports/${reportId}`);
            } else {
              console.log('reportId가 없습니다');
            }
          }}
        >
          <p className="text-[#64748B] text-sm font-semibold">질문지만 볼래요</p>
        </button>
        <button
          className="flex-1 h-11 px-5 bg-[#3B82F6] rounded-lg flex justify-center items-center cursor-pointer"
          onClick={() => {
            console.log('면접장으로 이동하기 클릭, reportId:', reportId);
            closeModal();
            if (reportId) {
              console.log('router.push 호출:', `/interview/${reportId}`);
              router.push(`/interview/${reportId}`);
            } else {
              console.log('reportId가 없습니다');
            }
          }}
        >
          <p className="text-white text-sm font-semibold">면접장으로 이동하기</p>
        </button>
      </div>
    );
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={closeModal}>
      <Modal
        title="질문지가 생성되었어요!"
        subTitle="포트폴리오를 기반으로 10개의 질문이 생성되었어요."
        onClose={closeModal}
        body={<ModalBody />}
        buttons={<ModalButtons />}
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
