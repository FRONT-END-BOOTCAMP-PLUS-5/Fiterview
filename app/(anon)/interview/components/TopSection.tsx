'use client';

import Timer from './Timer';
import WaveAnimation from '@/public/assets/icons/wave-animation.svg';

export default function TopSection({
  seconds,
  totalSeconds,
}: {
  seconds: number;
  totalSeconds: number;
}) {
  return (
    <section className="flex h-[70px] px-[32px] flex-col justify-center items-center gap-[16px] border-b border-slate-200 bg-[#F8FAFC]">
      <Timer seconds={seconds} totalSeconds={totalSeconds} />
      <div className="flex items-center gap-[8px]">
        <span className="flex w-[10px] h-[10px] bg-[#3B82F6] rounded-[5px]"></span>
        <p className="text-[#3B82F6] text-[13px] ">녹음 중</p>
        <WaveAnimation fill="#3B82F6" />
      </div>
    </section>
  );
}
