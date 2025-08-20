'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

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
      router.push('/user');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">로그인</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                사용자명
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="사용자명"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="text-center">
            <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              계정이 없으신가요? 회원가입
            </a>
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
          <div>
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
                        callbackUrl: '/user',
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
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
              Google로 로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
