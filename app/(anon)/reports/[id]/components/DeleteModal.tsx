'use client';

import Modal from '@/app/(anon)/components/modal/Modal';
import ModalOverlay from '@/app/(anon)/components/modal/ModalOverlay';
import AlertTriangle from '@/public/assets/icons/alert-triangle.svg';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <Modal
        title="면접 세션 삭제"
        onClose={onClose}
        body={
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold leading-tight text-slate-800">
                정말로 이 면접 세션을 삭제하시겠습니까?
              </p>
              <p className="text-sm font-normal leading-normal text-slate-500">
                모든 데이터(음성 파일, 스크립트, 피드백)가 영구적으로 제거됩니다.
                <br />이 작업은 되돌릴 수 없으니 신중하게 결정해 주세요.
              </p>
            </div>
          </div>
        }
        buttons={
          <div className="flex gap-3 w-full justify-center items-center">
            <button
              type="button"
              className="w-48 h-11 px-5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-300 inline-flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={onClose}
              disabled={isDeleting}
            >
              <div className="justify-start text-slate-500 text-sm font-medium font-['Inter'] leading-none">
                취소
              </div>
            </button>
            <button
              type="button"
              className="w-48 h-11 px-5 bg-red-600 text-sm font-semibold text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제하기'}
            </button>
          </div>
        }
      />
    </ModalOverlay>
  );
}
