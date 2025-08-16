'use client';

import { useEffect, useState } from 'react';

export default function Timer({
  seconds,
  totalSeconds,
}: {
  seconds: number;
  totalSeconds: number;
}) {
  // 남은 시간
  const remaining = Math.max(0, Math.min(seconds, totalSeconds));

  // 진행바
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (remaining === totalSeconds) {
      setStarted(false); // width: 100%
      const id = requestAnimationFrame(() => setStarted(true)); // width: 0%로 감소
      return () => cancelAnimationFrame(id);
    }
  }, [remaining, totalSeconds]);

  return (
    <div className="inline-flex justify-start items-center">
      <div className="relative flex w-[300px] h-[6px] bg-[#E2E8F0] rounded-[3px] overflow-hidden">
        <div
          className="h-full bg-[#3B82F6]"
          style={{
            width: started ? '0%' : '100%',
            transitionProperty: 'width',
            transitionTimingFunction: 'linear',
            transitionDuration: `${totalSeconds * 1000}ms`,
          }}
        />
      </div>
      <p className="w-[30px] text-[#1E293B] text-right text-[14px] font-semibold transition-all duration-300 ease-out">
        {remaining}
      </p>
      <p className="text-[#1E293B] text-[14px] font-semibold">초</p>
    </div>
  );
}
