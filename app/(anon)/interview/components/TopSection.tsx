'use client';

import Timer from './Timer';

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
    </section>
  );
}
