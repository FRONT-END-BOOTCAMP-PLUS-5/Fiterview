'use client';

import { useEffect, useState } from 'react';
import MicLogo from '@/public/assets/icons/mic-logo.svg';
import BackGround from '@/public/assets/icons/chat-round.svg';

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
      <div className="relative w-full pt-12">
        {showWalker && (
          <div className="pointer-events-none absolute left-0 w-full z-20" style={{ top: 0 }}>
            <div
              className="relative transition-[width] duration-[1200ms] ease-out"
              style={{ width: `${clampedPercent}%` }}
            >
              <div className="absolute right-0 " style={{ transform: 'translateX(25px)' }}>
                <div
                  className="relative"
                  style={{ transform: `scaleX(${flip ? -1 : 1})`, transformOrigin: '50% 50%' }}
                >
                  <div className="walker-bob" style={{ transformOrigin: '50% 50%' }}>
                    <div className="relative flex items-center justify-center">
                      <BackGround
                        width={48}
                        height={48}
                        stroke="#CBD5E1"
                        opacity={0.25}
                        strokeWidth={1.33}
                        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
                      />
                      <MicLogo
                        width={20}
                        height={20}
                        className="absolute"
                        style={{ transform: 'rotate(-20deg)', transformOrigin: '50% 50%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex w-full h-[6px] bg-[#E2E8F0] rounded-[3px] overflow-hidden mt-1">
          <div
            className="h-full bg-[#3B82F6] transition-[width] duration-[1200ms] ease-out"
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
        <div className="text-[14px] text-end text-gray-500 mt-1">{clampedPercent.toFixed(0)}%</div>
      </div>
    </div>
  );
}
