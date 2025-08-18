'use client';
import { useModalStore } from '@/stores/useModalStore';
import ModalOverlay from './ModalOverlay';
import Modal from './Modal';

export default function LoginModal() {
  const { isOpen, closeModal } = useModalStore();

  return (
    <ModalOverlay isOpen={isOpen} onClose={closeModal}>
      <Modal
        size="small"
        title="로그인이 필요한 서비스입니다."
        onClose={closeModal}
        buttons={<ModalButton onClose={closeModal} />}
      />
    </ModalOverlay>
  );
}

function ModalButton({ onClose }: { onClose: () => void }) {
  return (
    <div className="self-stretch h-11 bg-[#3B82F6] rounded-lg inline-flex justify-center items-center">
      <div
        className="text-white text-sm font-semibold"
        onClick={() => {
          onClose();
          window.location.href = '/login';
        }}
      >
        로그인하러 가기
      </div>
    </div>
  );
}
