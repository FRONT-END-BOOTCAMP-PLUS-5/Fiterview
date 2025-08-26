'use client';

interface ProgressBarProps {
  percent: number;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export default function ProgressBar({ percent, className = '', onClick }: ProgressBarProps) {
  // percent는 0-100 사이의 값
  const clampedPercent = Math.max(0, Math.min(percent, 100));

  return (
    <div className={`flex-1 flex justify-start items-center ${className}`}>
      <div
        className="relative flex w-full h-[6px] bg-[#E2E8F0] rounded-[3px] overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <div
          className="h-full bg-[#3B82F6]"
          style={{
            width: `${clampedPercent}%`,
            transition: 'none',
          }}
        />
      </div>
    </div>
  );
}
