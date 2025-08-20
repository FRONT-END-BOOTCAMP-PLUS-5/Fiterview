import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useModalStore } from '@/stores/useModalStore';

export const useLogout = () => {
  const { closeModal } = useModalStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // NextAuth 세션 정리
      await signOut({
        redirect: false,
        callbackUrl: '/login',
      });

      // 브라우저 캐시 및 로컬 스토리지 정리
      if (typeof window !== 'undefined') {
        // 로컬 스토리지 정리
        localStorage.clear();
        // 세션 스토리지 정리
        sessionStorage.clear();

        // Google OAuth 관련 쿠키 정리
        document.cookie.split(';').forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
      }

      closeModal();
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 오류가 발생해도 로그인 페이지로 이동
      closeModal();
      router.push('/login');
    }
  };

  return { handleLogout };
};
