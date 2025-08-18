'use client';
import { useRouter } from 'next/navigation';
import ModalOverlay from './ModalOverlay';
import Modal from './Modal';
import { useModalStore } from '@/stores/useModalStore';

export default function LoginModal() {
  const { isOpen, closeModal } = useModalStore();
  const router = useRouter();

  const ModalButton = () => {
    return (
      <button className="self-stretch h-11 bg-[#3B82F6] rounded-lg inline-flex justify-center items-center">
        <div
          className="text-white text-sm font-semibold cursor-pointer"
          onClick={() => {
            closeModal();
            router.push('/login');
          }}
        >
          로그인하러 가기
        </div>
      </button>
    );
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={closeModal}>
      <Modal
        size="small"
        title="로그인이 필요한 서비스입니다."
        onClose={closeModal}
        buttons={<ModalButton />}
      />
    </ModalOverlay>
  );
}
