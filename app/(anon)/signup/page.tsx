'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import SignupForm from '@/app/(anon)/signup/components/SignupForm';
import SignupFeatures from '@/app/(anon)/signup/components/SignupFeatures';

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
        <SignupForm
          formData={formData}
          passwordVisible={passwordVisible}
          confirmPasswordVisible={confirmPasswordVisible}
          isUsernameValid={isUsernameValid}
          isEmailValid={isEmailValid}
          isPasswordValid={isPasswordValid}
          passwordsMatch={passwordsMatch}
          serverUsernameDuplicate={serverUsernameDuplicate}
          serverEmailDuplicate={serverEmailDuplicate}
          loading={loading}
          isFormReady={isFormReady}
          onFormDataChange={handleChange}
          onPasswordVisibilityToggle={() => setPasswordVisible((v) => !v)}
          onConfirmPasswordVisibilityToggle={() => setConfirmPasswordVisible((v) => !v)}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Right Panel */}
      <SignupFeatures />
    </div>
  );
}
