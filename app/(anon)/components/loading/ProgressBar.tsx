'use client';

import { useEffect, useState } from 'react';
import MicLogo from '@/public/assets/icons/mic-logo.svg';

interface ProgressBarProps {
  percent: number;
  className?: string;
  showWalker?: boolean;
}

export default function ProgressBar({
  percent,
  className = '',
  showWalker = false,
}: ProgressBarProps) {
  const clampedPercent = Math.max(0, Math.min(percent, 100));
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (!showWalker || clampedPercent <= 0 || clampedPercent >= 100) return;
    const id = setInterval(() => setFlip((f) => !f), 1200);
    return () => clearInterval(id);
  }, [showWalker, clampedPercent]);

  const translateXPercent = clampedPercent <= 0 ? 0 : clampedPercent >= 100 ? -100 : -50;

  return (
    <div className={`flex-1 flex justify-start items-center ${className}`}>
      <div className="relative w-full pt-7">
        {showWalker && (
          <div className="pointer-events-none absolute left-0 w-full z-20" style={{ top: 0 }}>
            <div
              className="relative transition-[width] duration-[1200ms] ease-out"
              style={{ width: `${clampedPercent}%` }}
            >
              <div className="absolute right-0 top-0" style={{ transform: 'translateX(18px)' }}>
                <div
                  className="relative px-[9px]"
                  style={{ transform: `scaleX(${flip ? -1 : 1})`, transformOrigin: '50% 50%' }}
                >
                  <div className="walker-bob" style={{ transformOrigin: '50% 50%' }}>
                    <div style={{ transform: 'rotate(-20deg)', transformOrigin: '50% 50%' }}>
                      <MicLogo width={24} height={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex w-full h-[6px] bg-[#E2E8F0] rounded-[3px] overflow-hidden mt-3">
          <div
            className="h-full bg-[#3B82F6] transition-[width] duration-[1200ms] ease-out"
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
