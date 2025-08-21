'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeleteModal from './DeleteModal';

interface DeleteSectionProps {
  reportId: string;
}

export default function DeleteSection({ reportId }: DeleteSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/reports?id=${reportId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('리포트 삭제 성공:', result.message);
          // 삭제 성공 시 리포트 목록 페이지로 이동
          router.push('/reports');
        } else {
          console.error('삭제 실패:', result.message);
          alert('삭제에 실패했습니다: ' + result.message);
        }
      } else {
        const errorData = await response.json();
        console.error('삭제 실패:', errorData.message);
        alert('삭제에 실패했습니다: ' + errorData.message);
      }
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* 삭제 버튼 */}
      <div className="flex justify-end px-16 pb-8">
        <div
          className="w-20 h-10 bg-slate-400 rounded-lg inline-flex justify-center items-center cursor-pointer hover:bg-slate-500 transition-colors"
          onClick={handleDeleteClick}
        >
          <div className="justify-start text-white text-sm font-semibold leading-none">삭제</div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <DeleteModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
