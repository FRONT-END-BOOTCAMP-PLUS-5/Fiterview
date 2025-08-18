'use client';
import { useRouter } from 'next/navigation';
import ModalOverlay from './ModalOverlay';
import Modal from './Modal';
import { useModalStore } from '@/stores/useModalStore';

export default function LogoutModal() {
  const { isOpen, closeModal } = useModalStore();
  const router = useRouter();

  const ModalButton = () => {
    return (
      <div className="self-stretch h-11 bg-[#3B82F6] rounded-lg inline-flex justify-center items-center">
        <div
          className="text-white text-sm font-semibold cursor-pointer"
          onClick={() => {
            closeModal();
            router.push('/login');
          }}
        >
          로그아웃하기
        </div>
      </div>
    );
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={closeModal}>
      <Modal
        size="small"
        title="로그아웃하시겠습니까?"
        onClose={closeModal}
        buttons={<ModalButton />}
      />
    </ModalOverlay>
  );
}
