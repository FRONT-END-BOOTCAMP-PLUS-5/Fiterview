'use client';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import ModalOverlay from '@/app/(anon)/components/modal/ModalOverlay';
import Modal from '@/app/(anon)/components/modal/Modal';
import { useModalStore } from '@/stores/useModalStore';

export default function LogoutModal() {
  const { isOpen, closeModal } = useModalStore();
  const router = useRouter();

  const ModalButton = () => {
    return (
      <button
        type="button"
        className="self-stretch h-11 bg-[#3B82F6] rounded-lg inline-flex justify-center items-center"
        onClick={async () => {
          await signOut({ redirect: false });
          closeModal();
          router.push('/login');
        }}
      >
        <span className="text-white text-sm font-semibold">로그아웃하기</span>
      </button>
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
