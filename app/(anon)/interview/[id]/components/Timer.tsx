'use client';

import { useEffect, useRef, useState } from 'react';

export default function Timer({
  running,
  duration,
  onComplete,
}: {
  running: boolean;
  duration: number;
  onComplete?: () => void;
}) {
  // 남은 시간(초)
  const [remaining, setRemaining] = useState(duration);
  // 시작 시간
  const startAtRef = useRef<number | null>(null);
  // requestAnimationFrame ID
  const rafIdRef = useRef<number | null>(null);
  // 완료 여부
  const completedRef = useRef(false);

  // running 토글에 따라 타이머 시작/정지
  useEffect(() => {
    // 정지 처리
    if (!running) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      completedRef.current = false;
      setRemaining(duration);
      return;
    }

    // 시작 처리
    startAtRef.current = performance.now();
    completedRef.current = false;

    const tick = () => {
      const elapsed = (performance.now() - (startAtRef.current ?? 0)) / 1000;
      const left = Math.max(duration - elapsed, 0);
      setRemaining(left);
      if (left <= 0) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return; // rAF 루프 종료
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [running, duration, onComplete]);

  // 진행바 % (실시간 계산)
  const percent = running ? Math.max(0, Math.min(remaining / duration, 1)) * 100 : 100;
  const display = Math.ceil(remaining);

  return (
    <div className="inline-flex justify-start items-center">
      <div className="relative flex w-[300px] h-[6px] bg-[#E2E8F0] rounded-[3px] overflow-hidden">
        <div
          className="h-full bg-[#3B82F6]"
          style={{
            width: `${percent}%`,
            transition: 'none',
          }}
        />
      </div>
      <p className="w-[30px] text-[#1E293B] text-right text-[14px] font-semibold">{display}</p>
      <p className="text-[#1E293B] text-[14px] font-semibold">초</p>
    </div>
  );
}
