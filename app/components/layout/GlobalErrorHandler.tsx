'use client';

import { useEffect } from 'react';
import { useModalStore } from '@/stores/useModalStore';

export default function GlobalErrorHandler() {
  const { openModal } = useModalStore();

  useEffect(() => {
    // 로그인 모달 열기
    const handleOpenLoginModal = () => {
      openModal('login');
    };

    // 파일 에러 모달 열기
    const handleOpenFileErrorModal = () => {
      openModal('fileError');
    };

    // 질문 에러 모달 열기
    const handleOpenQuestionErrorModal = () => {
      openModal('questionError');
    };

    // 알림 표시
    const handleShowAlert = (event: CustomEvent) => {
      const message = event.detail?.message || '오류가 발생했습니다.';
      alert(message);
    };

    // 이벤트 리스너 등록
    window.addEventListener('open-login-modal', handleOpenLoginModal);
    window.addEventListener('open-file-error-modal', handleOpenFileErrorModal);
    window.addEventListener('open-question-error-modal', handleOpenQuestionErrorModal);
    window.addEventListener('show-alert', handleShowAlert as EventListener);

    // 클린업
    return () => {
      window.removeEventListener('open-login-modal', handleOpenLoginModal);
      window.removeEventListener('open-file-error-modal', handleOpenFileErrorModal);
      window.removeEventListener('open-question-error-modal', handleOpenQuestionErrorModal);
      window.removeEventListener('show-alert', handleShowAlert as EventListener);
    };
  }, [openModal]);

  return null;
}
