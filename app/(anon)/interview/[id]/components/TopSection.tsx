'use client';

import Timer from '@/app/(anon)/interview/[id]/components/Timer';
import WaveAnimation from '@/public/assets/icons/wave-animation.svg';

export default function TopSection({
  running,
  duration,
  onComplete,
}: {
  running: boolean;
  duration: number;
  onComplete?: () => void;
}) {
  return (
    <section className="flex px-[32px] flex-col justify-center items-center gap-[8px] border-b border-slate-200 bg-[#F8FAFC] py-[8px]">
      <Timer running={running} duration={duration} onComplete={onComplete} />
      <div className="flex items-center gap-[8px] w-full justify-center ">
        <span
          className={`flex w-[8px] h-[8px] rounded-[5px] ${running ? 'bg-[#3B82F6]' : 'bg-slate-300'}`}
        ></span>
        <p
          className={`{whitespace-nowrap text-[13px] font-medium ${running ? 'text-[#3B82F6]' : 'text-slate-400'}`}
        >
          녹음 중
        </p>
        {running ? (
          <WaveAnimation
            width={16}
            height={16}
            fill="#3B82F6"
            strokeWidth={0.8}
            className="text-[#3B82F6]"
          />
        ) : (
          <WaveAnimation
            width={16}
            height={16}
            fill="#E2E8F0"
            strokeWidth={0.8}
            className="text-[#E2E8F0]"
          />
        )}
      </div>
    </section>
  );
}
