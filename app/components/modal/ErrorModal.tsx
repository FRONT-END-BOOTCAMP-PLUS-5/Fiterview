'use client';
import Modal from '@/app/components/modal/Modal';
import ModalOverlay from '@/app/components/modal/ModalOverlay';
import { useModalStore } from '@/stores/useModalStore';

interface ErrorModalProps {
  subTitle: string;
}

export default function ErrorModal({ subTitle }: ErrorModalProps) {
  const { isOpen, closeModal } = useModalStore();

  const ModalButton = () => (
    <button
      className="self-stretch h-11 bg-[#3B82F6] rounded-lg inline-flex justify-center items-center cursor-pointer"
      onClick={closeModal}
    >
      <div className="text-white text-sm font-semibold">확인</div>
    </button>
  );

  return (
    <ModalOverlay isOpen={isOpen} onClose={closeModal}>
      <Modal
        size="medium"
        title="질문 생성 실패"
        subTitle={subTitle}
        onClose={closeModal}
        body={
          <div className="w-full text-left bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
            <p className="font-semibold mb-2">다음과 같은 파일들을 업로드해주세요</p>
            <ul className="list-disc list-inside space-y-1">
              <li>이력서 (경력, 프로젝트 경험 포함)</li>
              <li>자기소개서</li>
              <li>상세한 채용공고 (업무 내용, 기술 스택 등)</li>
              <li>포트폴리오</li>
            </ul>
          </div>
        }
        buttons={<ModalButton />}
      />
    </ModalOverlay>
  );
}
