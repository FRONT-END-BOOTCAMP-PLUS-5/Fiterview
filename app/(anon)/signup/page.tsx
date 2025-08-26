'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/app/components/Input';
import EyeOff from '@/public/assets/icons/eye-off.svg';
import axios from 'axios';
import MicIcon from '@/public/assets/icons/mic.svg';
import BrainIcon from '@/public/assets/icons/brain.svg';
import ChartIcon from '@/public/assets/icons/bar-chart.svg';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === 'username') {
      setError((prev) => (prev === '이미 사용 중인 사용자명입니다.' ? '' : prev));
    }
    if (name === 'email') {
      setError((prev) => (prev === '이미 사용 중인 이메일입니다.' ? '' : prev));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/signup', {
        username: formData.username,
        email: formData.email,
        nickname: formData.nickname,
        password: formData.password,
      });
      setCompleted(true);
      router.push('/login');
    } catch (e: any) {
      setError(
        e?.response?.data?.error || e?.response?.data?.message || '회원가입 중 오류가 발생했습니다.'
      );
      setLoading(false);
    }
  };

  // 아이디 유효성 검사
  const isUsernameValid = useMemo(() => {
    if (!formData.username) return true;
    return /^[a-zA-Z0-9]+$/.test(formData.username);
  }, [formData.username]);

  // 이메일 유효성 검사
  const isEmailValid = useMemo(() => {
    if (!formData.email) return true;
    return /\S+@\S+\.\S+/.test(formData.email);
  }, [formData.email]);

  // 비밀번호 유효성 검사
  const isPasswordValid = useMemo(() => {
    if (!formData.password) return true;
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(formData.password);
  }, [formData.password]);

  // 비밀번호 일치 여부 검사
  const passwordsMatch = useMemo(() => {
    if (!formData.confirmPassword) return true;
    return formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  // 서버에서 온 아이디 중복 에러 표시
  const serverUsernameDuplicate = useMemo(
    () => error === '이미 사용 중인 사용자명입니다.',
    [error]
  );
  // 서버에서 온 이메일 중복 에러 표시
  const serverEmailDuplicate = useMemo(() => error === '이미 사용 중인 이메일입니다.', [error]);

  // 폼 제출 준비 여부 검사
  const isFormReady =
    !!formData.username &&
    !!formData.email &&
    !!formData.nickname &&
    !!formData.password &&
    !!formData.confirmPassword &&
    isUsernameValid &&
    isEmailValid &&
    isPasswordValid &&
    passwordsMatch &&
    !serverUsernameDuplicate &&
    !serverEmailDuplicate &&
    !loading &&
    !completed;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-white flex justify-center items-center">
        <form onSubmit={handleSubmit} className="w-[400px] flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[32px] leading-[38.4px] text-[#1E293B] font-gmarket font-medium">
                회원가입
              </p>
              <p className="text-[16px] leading-[19.2px] text-[#64748B] font-semibold">
                핏터뷰와 함께하는 스마트한 면접 준비를 시작해보세요.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-2">
            {/* Username */}
            <div className="flex flex-col gap-2">
              <p className="text-[16px] leading-[16.8px] text-[#374151] font-bold">아이디</p>
              <div className="flex flex-col gap-2">
                <Input
                  type="text"
                  name="username"
                  placeholder="아이디를 입력하세요"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
                {!isUsernameValid ? (
                  <p className="text-[#EF4444] text-[12px] leading-[14px]">
                    아이디는 영문 또는 숫자만 사용할 수 있습니다.
                  </p>
                ) : serverUsernameDuplicate ? (
                  <p className="text-[#EF4444] text-[12px] leading-[14px]">
                    이미 사용 중인 아이디입니다.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <p className="text-[16px] leading-[16.8px] text-[#374151] font-bold">비밀번호</p>
              <div className="inline-flex">
                <Input
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<EyeOff />}
                  showPassword={() => setPasswordVisible((v) => !v)}
                />
              </div>
              <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
                {!isPasswordValid ? (
                  <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
                    비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <p className="text-[16px] leading-[16.8px] text-[#374151] font-bold">
                비밀번호 재입력
              </p>
              <div className="inline-flex">
                <Input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={<EyeOff />}
                  showPassword={() => setConfirmPasswordVisible((v) => !v)}
                />
              </div>
              <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
                {!passwordsMatch ? (
                  <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
                    비밀번호가 일치하지 않습니다.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <p className="text-[16px] leading-[16.8px] text-[#374151] font-bold">이메일</p>
              <div className="inline-flex">
                <Input
                  type="email"
                  name="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
                {!isEmailValid ? (
                  <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
                    이메일 형식이 맞지 않습니다.
                  </p>
                ) : serverEmailDuplicate ? (
                  <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
                    이미 사용 중인 이메일입니다.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Nickname */}
            <div className="flex flex-col gap-2">
              <p className="text-[16px] leading-[16.8px] text-[#374151] font-bold">닉네임</p>
              <div className="inline-flex">
                <Input
                  type="text"
                  name="nickname"
                  placeholder="닉네임을 입력하세요"
                  value={formData.nickname}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={!isFormReady}
              className={`${
                isFormReady
                  ? 'bg-[#3B82F6] text-white cursor-pointer'
                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              } h-[52px] rounded-[8px] inline-flex justify-center items-center text-[16px] font-semibold`}
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>

            <div className="inline-flex items-center justify-center gap-1">
              <p className="text-[14px] leading-[16.8px] text-[#94A3B8]">이미 계정이 있으신가요?</p>
              <Link
                href="/login"
                className="text-[14px] leading-[16.8px] text-[#3B82F6] font-semibold cursor-pointer"
              >
                로그인
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 bg-[#3B82F6] text-white p-20 flex justify-center items-center">
        <div className="w-[480px] h-[242px] flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <p className="text-[28px] leading-[33.6px] font-gmarket font-medium text-center">
              핏터뷰 AI의 특별함
            </p>
            <div className="flex flex-col gap-5">
              {/* Feature 1 */}
              <div className="inline-flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#629BF8] flex items-center justify-center">
                  <MicIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-white text-[18px] font-semibold leading-[21.6px]">
                    실시간 음성 분석
                  </p>
                  <p className="text-[14px] leading-[16.8px] font-normal text-[#CBD5E1]">
                    AI가 실시간으로 답변을 분석하고 피드백을 제공합니다
                  </p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="inline-flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#629BF8] flex items-center justify-center">
                  <BrainIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-[18px] leading-[21.6px] font-semibold">맞춤형 질문 생성</p>
                  <p className="text-[14px] leading-[16.8px] font-normal text-[#CBD5E1]">
                    이력서와 채용공고를 분석해 개인화된 질문을 생성합니다
                  </p>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="inline-flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#629BF8] flex items-center justify-center">
                  <ChartIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-[18px] leading-[21.6px] font-semibold">상세한 분석 리포트</p>
                  <p className="text-[14px] leading-[16.8px] font-normal text-[#CBD5E1]">
                    면접 후 상세한 분석과 개선점을 제공받을 수 있습니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
