'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Input from '@/app/(anon)/components/Input';
import { useSessionUser } from '@/lib/auth/useSessionUser';
import EyeOff from '@/public/assets/icons/eye-off.svg';
import axios from 'axios';
import Modal from '@/app/(anon)/components/modal/Modal';
import { useRouter } from 'next/navigation';
import ModalOverlay from '../components/modal/ModalOverlay';
import { useSession } from 'next-auth/react';

export default function User() {
  const router = useRouter();
  const { user } = useSessionUser();
  const { data: loginSession, update: updateSession } = useSession();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? '');
      setEmail(user.email ?? '');
      setNickname(user.nickname ?? '');
    }
  }, [user]);

  const isGoogleLogin = (loginSession as any)?.provider === 'google';

  const isPasswordValid = useMemo(() => {
    if (!password) return true;
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
  }, [password]);

  const isConfirmMismatch = useMemo(() => {
    if (!password && !confirmPassword) return false;
    return password !== confirmPassword;
  }, [password, confirmPassword]);

  const isEmailValid = useMemo(() => {
    if (!email) return true;
    return /\S+@\S+\.\S+/.test(email);
  }, [email]);

  const serverEmailDuplicate = useMemo(() => error === '이미 사용 중인 이메일입니다.', [error]);

  const isFormReady = useMemo(() => {
    const passwordOk = (!password && !confirmPassword) || (isPasswordValid && !isConfirmMismatch);
    return (
      !!nickname &&
      !!email &&
      isEmailValid &&
      passwordOk &&
      !serverEmailDuplicate &&
      !loading &&
      !completed
    );
  }, [
    nickname,
    email,
    isEmailValid,
    password,
    confirmPassword,
    isPasswordValid,
    isConfirmMismatch,
    loading,
    completed,
    error,
  ]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.put('/api/auth/profile', {
        email,
        nickname,
        password,
      });
      setCompleted(true);
      handleModalOpen();

      // Update next-auth session so UI reflects updated email/nickname
      await updateSession?.({ user: { email, nickname } });
    } catch (e: any) {
      setError(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          '정보 수정 중 오류가 발생했습니다.'
      );
      setLoading(false);
    }
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push('/');
  };

  const ModalButton = () => {
    return (
      <button
        className="self-stretch h-11 bg-[#3B82F6] rounded-lg inline-flex justify-center items-center cursor-pointer"
        onClick={() => {
          handleModalClose();
        }}
      >
        <div className="text-white text-sm font-semibold">확인</div>
      </button>
    );
  };

  return (
    <main className="w-full h-full px-32 py-16 flex items-center justify-center">
      <div className="w-[1184px] flex items-end justify-end">
        <section className="w-full px-[200px] py-[88px] bg-white rounded-[16px] border border-[#E2E8F0] flex flex-col items-center justify-between">
          <form
            onSubmit={onSubmit}
            className="w-[800px] flex flex-col items-center justify-center gap-8"
          >
            <header className="w-full flex flex-col items-start justify-center gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-[32px] leading-[38.4px] font-bold text-slate-800">개인정보</p>
              </div>
            </header>

            <div className="w-full flex flex-col items-start gap-2">
              {/* 아이디 */}
              <div className="w-full flex flex-col gap-2">
                <p className="text-sm leading-[16.8px] font-semibold text-gray-700">아이디</p>
                <div className="w-full flex py-[12px] px-[16px] bg-[#F8FAFC] justify-center rounded-[8px] border border-[#CBD5E1]">
                  <span className="w-full text-[16px] font-normal text-[#928A8A] truncate">
                    {username || '-'}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]" />
              </div>

              {/* 비밀번호 */}
              <div className="w-full flex flex-col gap-2">
                <p className="text-sm leading-[16.8px] font-semibold text-gray-700">비밀번호</p>
                <Input
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  placeholder="비밀번호 수정을 원하시면 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<EyeOff />}
                  showPassword={() => setPasswordVisible((v) => !v)}
                  disabled={isGoogleLogin}
                  required={false}
                />
                <div className="w-full inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
                  {!isPasswordValid ? (
                    <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
                      비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.
                    </p>
                  ) : null}
                </div>
              </div>

              {/* 비밀번호 재입력 */}
              <div className="w-full flex flex-col gap-2">
                <p className="text-sm leading-[16.8px] font-semibold text-gray-700">
                  비밀번호 재입력
                </p>
                <Input
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="비밀번호 수정을 원하시면 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<EyeOff />}
                  showPassword={() => setConfirmPasswordVisible((v) => !v)}
                  disabled={isGoogleLogin}
                  required={false}
                />
                <div className="w-full inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
                  {isConfirmMismatch ? (
                    <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  ) : null}
                </div>
              </div>

              {/* 이메일 */}
              <div className="w-full flex flex-col gap-2">
                <p className="text-sm leading-[16.8px] font-semibold text-gray-700">이메일</p>
                <Input
                  type="email"
                  name="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isGoogleLogin}
                />
                <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
                  {!isEmailValid ? (
                    <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
                      이메일 형식이 맞지 않습니다.
                    </p>
                  ) : null}
                </div>
              </div>

              {/* 닉네임 */}
              <div className="w-full flex flex-col gap-2">
                <p className="text-sm leading-[16.8px] font-semibold text-gray-700">닉네임</p>
                <Input
                  type="text"
                  name="nickname"
                  placeholder="닉네임을 입력하세요"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={isGoogleLogin}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormReady || isGoogleLogin}
              className={`${
                isFormReady
                  ? `bg-[#3B82F6] text-white ${
                      isGoogleLogin
                        ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                        : 'cursor-pointer'
                    }`
                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              } w-full h-[52px] rounded-[8px] inline-flex items-center justify-center text-[16px] leading-[19.2px] font-semibold`}
            >
              {isGoogleLogin ? '구글 로그인 계정은 수정할 수 없습니다.' : '수정하기'}
            </button>
          </form>
        </section>
      </div>
      <ModalOverlay isOpen={isModalOpen} onClose={handleModalClose}>
        <Modal
          title="회원정보가 수정되었습니다."
          buttons={<ModalButton />}
          onClose={handleModalClose}
          size="medium"
          hideX={true}
        />
      </ModalOverlay>
    </main>
  );
}
