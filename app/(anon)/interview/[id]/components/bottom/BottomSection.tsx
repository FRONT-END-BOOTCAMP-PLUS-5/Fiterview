'use client';

import { useState, useEffect } from 'react';
import ArrowRight from '@/public/assets/icons/arrow-right.svg';
import Exit from '@/public/assets/icons/exit.svg';
import { useRouter } from 'next/navigation';

interface BottomSectionProps {
  currentQuestion: number;
  totalQuestions: number;
  onNext: () => void;
  isDisabled?: boolean;
  nextLabel?: string;
}

export default function BottomSection({
  currentQuestion,
  totalQuestions,
  onNext,
  isDisabled,
  nextLabel,
}: BottomSectionProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const handleExit = () => {
    router.push('/interview');
  };
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <section className="relative flex justify-between items-center px-[24px] py-[16px] border-t border-slate-200 bg-[#F8FAFC] cursor-default">
      <button
        className="inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-[8px] bg-[#F8FAFC] text-[#3B82F6] text-[14px] font-semibold cursor-pointer"
        onClick={handleExit}
      >
        <Exit width={18} height={18} strokeWidth={0.5} />
        나가기
      </button>
      <p
        className="absolute left-1/2 -translate-x-1/2 text-[#64748B] text-[12px] font-medium"
        suppressHydrationWarning
      >
        질문 {mounted ? currentQuestion : '-'} / {totalQuestions}
      </p>
      <button
        onClick={onNext}
        disabled={isDisabled}
        className="inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-[8px] bg-[#3B82F6] text-white text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2563EB] cursor-pointer"
      >
        {mounted ? nextLabel : '다음 질문'}
        <ArrowRight width={16} height={16} />
      </button>
    </section>
  );
}
