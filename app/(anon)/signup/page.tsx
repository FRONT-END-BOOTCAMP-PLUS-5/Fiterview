'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Input from '@/app/(anon)/components/Input';
import EyeOff from '@/public/assets/icons/eye-off.svg';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          nickname: formData.nickname,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="username"
          placeholder="사용할 아이디를 입력하세요."
          value={formData.username}
          onChange={handleChange}
        />
        <Input
          type={passwordVisible ? 'text' : 'password'}
          name="password"
          placeholder="비밀번호를 입력하세요."
          value={formData.password}
          onChange={handleChange}
          icon={<EyeOff className="w-[20px] h-[20px] text-[#94A3B8] cursor-pointer" />}
          showPassword={() => setPasswordVisible((v) => !v)}
        />
      </form>
    </div>
    // <div className="min-h-screen flex items-center justify-center bg-gray-50">
    //   <div className="max-w-md w-full space-y-8">
    //     <div>
    //       <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">회원가입</h2>
    //     </div>
    //     <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
    //       <div className="rounded-md shadow-sm -space-y-px">
    //         <div>
    //           <input
    //             name="username"
    //             type="text"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
    //             placeholder="사용자명"
    //             value={formData.username}
    //             onChange={handleChange}
    //           />
    //         </div>
    //         <div>
    //           <input
    //             name="email"
    //             type="email"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
    //             placeholder="이메일"
    //             value={formData.email}
    //             onChange={handleChange}
    //           />
    //         </div>
    //         <div>
    //           <input
    //             name="nickname"
    //             type="text"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
    //             placeholder="닉네임"
    //             value={formData.nickname}
    //             onChange={handleChange}
    //           />
    //         </div>
    //         <div>
    //           <input
    //             name="password"
    //             type="password"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
    //             placeholder="비밀번호"
    //             value={formData.password}
    //             onChange={handleChange}
    //           />
    //         </div>
    //         <div>
    //           <input
    //             name="confirmPassword"
    //             type="password"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
    //             placeholder="비밀번호 확인"
    //             value={formData.confirmPassword}
    //             onChange={handleChange}
    //           />
    //         </div>
    //       </div>

    //       {error && <div className="text-red-500 text-sm text-center">{error}</div>}

    //       {success && <div className="text-green-500 text-sm text-center">{success}</div>}

    //       <div>
    //         <button
    //           type="submit"
    //           disabled={loading}
    //           className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    //         >
    //           {loading ? '가입 중...' : '회원가입'}
    //         </button>
    //       </div>

    //       <div className="text-center">
    //         <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
    //           이미 계정이 있으신가요? 로그인
    //         </a>
    //       </div>

    //       {/* 구분선 */}
    //       <div className="relative">
    //         <div className="absolute inset-0 flex items-center">
    //           <div className="w-full border-t border-gray-300" />
    //         </div>
    //         <div className="relative flex justify-center text-sm">
    //           <span className="px-2 bg-gray-50 text-gray-500">또는</span>
    //         </div>
    //       </div>

    //       {/* Google OAuth 회원가입 버튼 */}
    //       <div>
    //         <button
    //           type="button"
    //           onClick={() => signIn('google', { callbackUrl: '/user' })}
    //           className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    //         >
    //           <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    //             <path
    //               fill="#4285F4"
    //               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    //             />
    //             <path
    //               fill="#34A853"
    //               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    //             />
    //             <path
    //               fill="#FBBC05"
    //               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    //             />
    //             <path
    //               fill="#EA4335"
    //               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    //             />
    //           </svg>
    //           Google로 회원가입
    //         </button>
    //       </div>

    //     </form>
    //   </div>
    // </div>
  );
}
