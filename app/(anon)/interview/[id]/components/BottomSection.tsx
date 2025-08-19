'use client';

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
  nextLabel = '다음 질문',
}: BottomSectionProps) {
  return (
    <section className="relative flex items-center px-[24px] py-[16px] border-t border-slate-200 bg-[#F8FAFC]">
      <p className="absolute left-1/2 -translate-x-1/2 text-[#64748B] text-[12px] font-medium">
        질문 {currentQuestion}/{totalQuestions}
      </p>
      <button
        onClick={onNext}
        disabled={isDisabled}
        className="ml-auto inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-[8px] bg-[#3B82F6] text-white text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2563EB]"
      >
        {nextLabel}
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10.293 15.707a1 1 0 010-1.414L12.586 12H4a1 1 0 110-2h8.586l-2.293-2.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </section>
  );
}
