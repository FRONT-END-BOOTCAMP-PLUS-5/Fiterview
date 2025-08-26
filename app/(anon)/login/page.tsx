'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/app/(anon)/components/Input';
import EyeOff from '@/public/assets/icons/eye-off.svg';
import Logo from '@/public/assets/icons/logo1.svg';
import Subtitle from '@/public/assets/icons/logo-subtitle.svg';

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
      router.push('/user');
    }
  }, [status, session, router]);

  // 로그인 성공 후 리다이렉트
  useEffect(() => {
    if (redirecting) {
      router.push('/');
    }
  }, [redirecting, router]);

  if (status === 'loading') return <div>로딩 중...</div>;
  if (status === 'authenticated' && session) {
    return <div>로그인 중...</div>;
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
      <div className="w-1/2 p-20 flex justify-center items-center flex-col">
        <Logo width={256} height={102} className="stroke-0" />
        <Subtitle width={610} height={16.8} className="stroke-0" />
      </div>

      <div className="w-1/2 bg-white p-20 flex justify-center items-center">
        <form onSubmit={handleSubmit} className="w-[400px] flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[32px] leading-[38.4px] text-[#1E293B] font-gmarket font-medium">
                로그인
              </p>
              <p className="text-[16px] leading-[19.2px] text-[#64748B] font-medium">
                계정에 로그인하여 AI 면접을 경험해보세요.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-[14px] leading-[16.8px] text-[#374151] font-semibold">아이디</p>
              <div className="flex flex-col gap-1">
                <Input
                  type="text"
                  name="username"
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[14px] leading-[16.8px] text-[#374151] font-semibold">비밀번호</p>
              <div className="inline-flex">
                <Input
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<EyeOff />}
                  showPassword={() => setPasswordVisible((v) => !v)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={!isFormReady}
              className={`${isFormReady ? 'bg-[#3B82F6] text-white cursor-pointer' : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'} h-[52px] rounded-[8px] inline-flex justify-center items-center text-[16px] font-semibold`}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            <div className="min-h-[18px] -mt-2 -mb-2">
              {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
            </div>

            <div className="inline-flex items-center justify-center gap-1">
              <p className="text-[14px] leading-[16.8px] text-[#94A3B8]">아직 계정이 없으신가요?</p>
              <Link
                href="/signup"
                className="text-[14px] leading-[16.8px] text-[#3B82F6] font-semibold"
              >
                회원가입
              </Link>
            </div>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">또는</span>
              </div>
            </div>

            {/* Google OAuth 로그인 버튼 */}
            <div className="font-roboto">
              <button
                type="button"
                onClick={async () => {
                  try {
                    console.log('Google 로그인 시작 - 현재 세션 정리 중...');

                    // 기존 세션 정리
                    await signOut({ redirect: false });

                    console.log('NextAuth 세션 정리 완료 - 브라우저 캐시 정리 중...');

                    // 강제로 브라우저 캐시 정리
                    if (typeof window !== 'undefined') {
                      // 모든 인증 관련 쿠키 삭제
                      document.cookie.split(';').forEach(function (c) {
                        const eqPos = c.indexOf('=');
                        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
                      });

                      // 로컬 스토리지 완전 정리
                      localStorage.clear();
                      sessionStorage.clear();

                      // Google OAuth 관련 스토리지 정리
                      if (typeof window !== 'undefined' && (window as any).gapi) {
                        const gapi = (window as any).gapi;
                        if (gapi.auth2?.getAuthInstance()) {
                          gapi.auth2.getAuthInstance().signOut();
                        }
                      }

                      console.log('브라우저 캐시 정리 완료');
                    }

                    // 잠시 대기 후 Google OAuth 로그인
                    console.log('Google OAuth 로그인 시도 중...');
                    setTimeout(async () => {
                      try {
                        // Google OAuth 로그인 시도 (계정 선택 강제)
                        await signIn('google', {
                          callbackUrl: '/',
                          prompt: 'select_account',
                        });
                      } catch (error) {
                        console.error('Google 로그인 중 오류:', error);
                      }
                    }, 100);
                  } catch (error) {
                    console.error('Google 로그인 중 오류:', error);
                  }
                }}
                className="inline-flex items-center justify-center w-full h-[52px] my-4 bg-white rounded-[8px] border border-[#E2E8F0] shadow px-4 text-sm cursor-pointer"
              >
                <svg className="w-5 h-5 mr-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-black/60 font-semibold">Google 계정으로 로그인</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
