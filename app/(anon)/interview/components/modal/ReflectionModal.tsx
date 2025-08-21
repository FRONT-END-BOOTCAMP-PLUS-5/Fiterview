'use client';
import Modal from '@/app/(anon)/components/modal/Modal';
import ModalOverlay from '@/app/(anon)/components/modal/ModalOverlay';
import { useModalStore } from '@/stores/useModalStore';
import { useRouter } from 'next/navigation';

export default function ReflectionModal() {
  const router = useRouter();
  const { isOpen, currentStep, closeModal, replaceModal } = useModalStore();
  if (!isOpen || currentStep !== 'reflection') return null;

  const NextButton = ({ onClick }: { onClick?: () => void }) => (
    <button className="self-stretch h-11 bg-[#3B82F6] rounded-lg inline-flex justify-center items-center">
      <div
        className="text-white text-sm font-semibold cursor-pointer"
        onClick={() => {
          handleReplaceModal();
        }}
      >
        다음
      </div>
    </button>
  );

  const SkipButton = () => (
    <button className="self-stretch h-11 bg-[#FFFFFF] rounded-lg inline-flex justify-center items-center">
      <div
        className="text-[#64748B] text-sm font-semibold cursor-pointer"
        onClick={() => {
          closeModal();
          router.push('/');
        }}
      >
        건너뛰기
      </div>
    </button>
  );

  const handleReplaceModal = () => {
    replaceModal('video');
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={closeModal}>
      <Modal
        size="large"
        title="수고하셨습니다. 면접이 끝났어요."
        subTitle="회고는 면접 직후에 하면 더 오래 기억에 남아요."
        onClose={closeModal}
        body={
          <textarea
            className="w-[432px] h-[132px] self-stretch px-4 py-3 bg-slate-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-300 resize-none align-top"
            placeholder="모의면접 진행 후 느낀점을 자유롭게 적어주세요."
          />
        }
        buttons={
          <div className="self-stretch inline-flex justify-center items-center gap-3">
            <div className="flex-1 h-11 px-5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-300 flex justify-center items-center gap-1">
              <SkipButton />
            </div>
            <div className="flex-1 h-11 px-5 bg-blue-500 rounded-lg flex justify-center items-center">
              <NextButton onClick={handleReplaceModal} />
            </div>
          </div>
        }
      />
    </ModalOverlay>
  );
}
