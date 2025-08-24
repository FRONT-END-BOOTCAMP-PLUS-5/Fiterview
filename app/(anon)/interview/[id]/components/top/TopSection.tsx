'use client';

import Timer from '@/app/(anon)/interview/[id]/components/top/Timer';

interface TopSectionProps {
  running: boolean;
  duration: number;
  onComplete?: () => void;
}

export default function TopSection({ running, duration, onComplete }: TopSectionProps) {
  return (
    <section className="flex px-[32px] flex-col justify-center items-center gap-[8px] border-b border-slate-200 bg-[#F8FAFC] py-[8px] cursor-default ">
      <Timer running={running} duration={duration} onComplete={onComplete} />
      <div className="flex items-center gap-[8px] w-full justify-center ">
        <span
          className={`flex w-[8px] h-[8px] rounded-[5px] ${running ? 'bg-[#3B82F6]' : 'bg-slate-400'}`}
        ></span>
        <p
          className={`{whitespace-nowrap text-[13px] font-medium ${running ? 'text-[#3B82F6]' : 'text-slate-400'}`}
        >
          녹음 중
        </p>
      </div>
    </section>
  );
}
