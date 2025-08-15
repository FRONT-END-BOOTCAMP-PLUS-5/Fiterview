'use client';

export default function Timer({
  seconds,
  totalSeconds,
}: {
  seconds: number;
  totalSeconds: number;
}) {
  const clamped = Math.max(0, Math.min(seconds, totalSeconds));
  const progress = (clamped / totalSeconds) * 100;

  return (
    <div className="flex justify-start items-center gap-[12px]">
      <div className="relative flex w-[300px] h-[6px] bg-[#E2E8F0] rounded-[3px] overflow-hidden">
        <div className="h-full bg-[#3B82F6]" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-[#1E293B] text-[14px] font-semibold">{clamped}초</p>
    </div>
  );
}
