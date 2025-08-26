'use client';

import React from 'react';

interface SubmitButtonProps {
  isFormReady: boolean;
  isGoogleLogin: boolean;
  readyLabel?: string;
  googleDisabledLabel?: string;
}

export default function SubmitButton({
  isFormReady,
  isGoogleLogin,
  readyLabel = '수정하기',
  googleDisabledLabel = '구글 로그인 계정은 수정할 수 없습니다.',
}: SubmitButtonProps) {
  const disabled = !isFormReady || isGoogleLogin;
  const className = `${
    isFormReady
      ? `bg-[#3B82F6] text-white ${
          isGoogleLogin ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed' : 'cursor-pointer'
        }`
      : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
  } w-full h-[52px] rounded-[8px] inline-flex items-center justify-center text-[16px] leading-[19.2px] font-semibold`;

  const label = isGoogleLogin ? googleDisabledLabel : readyLabel;

  return (
    <button type="submit" disabled={disabled} className={className}>
      {label}
    </button>
  );
}
