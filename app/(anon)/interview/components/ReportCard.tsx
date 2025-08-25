'use client';

import { useRouter } from 'next/navigation';
import Arrow from '@/public/assets/icons/arrow.svg';

interface ReportCardProps {
  report: {
    id: string | number;
    title: string;
  };
  onClick?: () => void;
  className?: string;
}

export default function ReportCard({ report, onClick, className = '' }: ReportCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // 기본 동작: 인터뷰 페이지로 이동
      router.push(`/interview/${report.id}`);
    }
  };

  return (
    <div
      className={`self-stretch h-20 p-6 rounded-xl outline-1 outline-offset-[-1px] outline-slate-200 flex justify-between items-center cursor-pointer
                 bg-gradient-to-r from-white/30 via-blue-300/10 to-blue-500/25
                 bg-[length:150%_100%] bg-[position:0%_0%]
                 hover:bg-[position:100%_0%]
                 transition-[background-position] duration-700 ease-out ${className}`}
      onClick={handleClick}
    >
      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
        <span className="justify-start text-slate-800 text-base font-semibold">{report.title}</span>
      </div>
      <div className="rounded-[10px] flex items-center gap-2">
        <Arrow width={18} height={18} strokeWidth={1.67} stroke="#3B82F6" />
        <span className="justify-start text-blue-500 text-sm font-semibold">시작</span>
      </div>
    </div>
  );
}
