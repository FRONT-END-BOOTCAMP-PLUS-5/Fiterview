'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginHeader from '@/app/(anon)/login/components/LoginHeader';
import LoginForm from '@/app/(anon)/login/components/LoginForm';
import { LoadingSpinner } from '@/app/components/loading/LoadingSpinner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // 페이지 로드 시 브라우저 캐시 정리
  useEffect(() => {
    const clearBrowserCache = () => {
      if (typeof window !== 'undefined') {
        // 로컬 스토리지에서 인증 관련 데이터 정리
        const keysToRemove = Object.keys(localStorage).filter(
          (key) =>
            key.includes('auth') ||
            key.includes('session') ||
            key.includes('next-auth') ||
            key.includes('google')
        );

        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // 세션 스토리지 정리
        sessionStorage.clear();

        // Google OAuth 관련 쿠키 정리
        document.cookie.split(';').forEach(function (c) {
          if (c.includes('google') || c.includes('auth') || c.includes('session')) {
            document.cookie = c
              .replace(/^ +/, '')
              .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
          }
        });
      }
    };

    clearBrowserCache();
  }, []);

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/');
    }
  }, [status, session, router]);

  // 로그인 성공 후 리다이렉트
  useEffect(() => {
    if (redirecting) {
      router.push('/');
    }
  }, [redirecting, router]);

  if (status === 'loading')
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] flex justify-center items-center">
        <LoadingSpinner size="medium" message="로딩 중" />
      </div>
    );
  if (status === 'authenticated' && session) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] flex justify-center items-center">
        <LoadingSpinner size="medium" message="로그인 중" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.');
      } else {
        setRedirecting(true);
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isFormReady = !!username && !!password && !loading;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex">
      <LoginHeader />

      <div className="w-1/2 bg-white p-20 flex justify-center items-center">
        <LoginForm
          username={username}
          password={password}
          passwordVisible={passwordVisible}
          loading={loading}
          error={error}
          isFormReady={isFormReady}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onPasswordVisibilityToggle={() => setPasswordVisible((v) => !v)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
