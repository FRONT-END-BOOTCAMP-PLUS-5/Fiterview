'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <div className={`flex-1 flex justify-start items-center ${className}`}>
      <div className="relative w-full pt-13">
        {showWalker && (
          <div className="pointer-events-none absolute left-0 w-full z-20 top-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clampedPercent}%` }}
              transition={{
                duration: 3,
                ease: 'easeOut',
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="relative"
            >
              <div className="absolute right-0">
                <div
                  className="relative"
                  style={{ transform: `scaleX(${flip ? -1 : 1})`, transformOrigin: '50% 50%' }}
                >
                  <div className="walker-bob" style={{ transformOrigin: '50% 50%' }}>
                    <div className="relative flex items-center justify-center">
                      <MicLogo width={25} height={25} className="absolute -rotate-[20deg]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        <div className="flex w-full h-[10px] bg-gray-100 rounded-[6px] overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedPercent}%` }}
            transition={{
              duration: 3,
              ease: 'easeOut',
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="h-full bg-[#3B82F6]"
          />
        </div>
        <div className="text-[14px] text-end text-gray-500 mt-1">{clampedPercent.toFixed(0)}%</div>
      </div>
    </div>
  );
}
