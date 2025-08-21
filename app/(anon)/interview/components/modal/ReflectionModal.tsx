'use client';
import Modal from '@/app/(anon)/components/modal/Modal';
import ModalOverlay from '@/app/(anon)/components/modal/ModalOverlay';
import { useModalStore } from '@/stores/useModalStore';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ReflectionModal() {
  const { id } = useParams<{ id: string }>();
  const reportId = Number(id);
  const [reflection, setReflection] = useState<string>('');
  const { isOpen, currentStep, closeModal, replaceModal } = useModalStore();
  if (!isOpen || currentStep !== 'reflection') return null;

  const NextButton = ({ onClick, className }: { onClick?: () => void; className?: string }) => (
    <button
      type="button"
      className={`flex-1 h-11 px-5 rounded-lg inline-flex justify-center items-center ${className ?? ''}`}
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          console.error('NextButton onClick is not defined');
        }
      }}
    >
      <div className="text-white text-sm font-semibold">다음</div>
    </button>
  );

  const SkipButton = ({ onClick, className }: { onClick?: () => void; className?: string }) => (
    <button
      type="button"
      className={`flex-1 h-11 px-5 rounded-lg inline-flex justify-center items-center ${className ?? ''}`}
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          console.error('SkipButton onClick is not defined');
        }
      }}
    >
      <div className="text-[#64748B] text-sm font-semibold">건너뛰기</div>
    </button>
  );

  const handleSubmitReflection = async () => {
    try {
      await axios.put(`/api/reports/${reportId}`, {
        reflection: reflection,
      });
      console.log('reflection submitted');
      replaceModal('video');
    } catch (error) {
      console.error(error);
      replaceModal('video');
    }
  };

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
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
        }
        buttons={
          <div className="w-full inline-flex justify-center items-center gap-3">
            <SkipButton
              className="bg-white outline outline-1 outline-offset-[-1px] outline-slate-300"
              onClick={handleReplaceModal}
            />
            <NextButton className="bg-blue-500" onClick={handleSubmitReflection} />
          </div>
        }
      />
    </ModalOverlay>
  );
}
