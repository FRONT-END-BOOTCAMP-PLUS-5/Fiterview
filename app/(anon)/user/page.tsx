'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Input from '@/app/(anon)/components/Input';
import LabeledInput from '@/app/(anon)/user/components/LabeledInput';
import StaticField from '@/app/(anon)/user/components/StaticField';
import SubmitButton from '@/app/(anon)/user/components/SubmitButton';
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
              <StaticField label="아이디" value={username} />

              <LabeledInput
                label="비밀번호"
                type={passwordVisible ? 'text' : 'password'}
                name="password"
                placeholder="비밀번호 수정을 원하시면 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<EyeOff />}
                showPassword={() => setPasswordVisible((v) => !v)}
                disabled={isGoogleLogin}
                required={false}
                error={
                  !isPasswordValid
                    ? '비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.'
                    : null
                }
              />

              <LabeledInput
                label="비밀번호 재입력"
                type={confirmPasswordVisible ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="비밀번호 수정을 원하시면 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<EyeOff />}
                showPassword={() => setConfirmPasswordVisible((v) => !v)}
                disabled={isGoogleLogin}
                required={false}
                error={isConfirmMismatch ? '비밀번호가 일치하지 않습니다.' : null}
              />

              <LabeledInput
                label="이메일"
                type="email"
                name="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isGoogleLogin}
                error={!isEmailValid ? '이메일 형식이 맞지 않습니다.' : null}
              />

              <LabeledInput
                label="닉네임"
                type="text"
                name="nickname"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isGoogleLogin}
              />
            </div>

            <SubmitButton isFormReady={isFormReady} isGoogleLogin={isGoogleLogin} />
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
