'use client';

import { useRouter } from 'next/navigation';
import Arrow from '@/public/assets/icons/arrow.svg';
import File from '@/public/assets/icons/file.svg';
import PlayCircle from '@/public/assets/icons/play-circle.svg';

interface ReportDetailCardProps {
  report: {
    id: string | number;
    title: string;
    score?: number;
    status?: 'PENDING' | 'ANALYZING' | 'COMPLETED';
  };
  onClick?: () => void;
  className?: string;
}

export default function ReportDetailCard({
  report,
  onClick,
  className = '',
}: ReportDetailCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // 기본 동작: 리포트 상세 페이지로 이동
      router.push(`/reports/${report.id}`);
    }
  };

  // 상태에 따른 배경 클래스 결정
  const getBackgroundClass = () => {
    switch (report.status) {
      case 'ANALYZING':
        return 'bg-gray-100';
      case 'PENDING':
        return 'bg-white hover:bg-gray-100 transition-colors duration-200';
      default:
        return 'bg-gradient-to-r from-white/30 via-blue-300/10 to-blue-500/25 bg-[length:150%_100%] bg-[position:0%_0%] hover:bg-[position:100%_0%] transition-[background-position] duration-700 ease-out';
    }
  };

  // 상태에 따른 커서와 클릭 이벤트 결정
  const getCardProps = () => {
    if (report.status === 'COMPLETED' || !report.status) {
      return {
        className: `self-stretch h-20 p-6 rounded-xl outline-1 outline-offset-[-1px] outline-slate-200 flex justify-between items-center cursor-pointer ${getBackgroundClass()} ${className}`,
        onClick: () => router.push(`/reports/${report.id}`),
      };
    }

    return {
      className: `self-stretch h-20 p-6 rounded-xl outline-1 outline-offset-[-1px] outline-slate-200 flex justify-between items-center ${getBackgroundClass()} ${className}`,
    };
  };

  return (
    <div {...getCardProps()}>
      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
        <span className="justify-start text-slate-800 text-base font-semibold">{report.title}</span>
      </div>
      <div className="flex items-center gap-3">
        {/* 상태에 따른 UI 렌더링 */}
        {report.status === 'PENDING' && (
          <>
            {/* 질문 보기 */}
            <div
              className="flex items-center gap-1 cursor-pointer hover:opacity-80"
              onClick={() => router.push(`/reports/${report.id}`)}
            >
              <File width={18} height={18} strokeWidth={1.3} className="text-slate-500" />
              <span className="text-slate-500 text-sm font-medium">질문 보기</span>
            </div>

            {/* 구분선 */}
            <div className="w-px h-6 bg-slate-300"></div>

            {/* 면접 시작 */}
            <div
              className="flex items-center gap-1 cursor-pointer hover:opacity-80"
              onClick={() => router.push(`/interview/${report.id}`)}
            >
              <PlayCircle width={18} height={18} strokeWidth={1.3} className="text-blue-500" />
              <span className="text-blue-500 text-sm font-bold">면접 시작</span>
            </div>
          </>
        )}

        {report.status === 'ANALYZING' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm font-medium">분석중</span>
            <div className="w-1 h-1 bg-slate-400 rounded-full animate-pulse"></div>
          </div>
        )}

        {(report.status === 'COMPLETED' || !report.status) && (
          <>
            {/* 점수 표시 */}
            {report.score !== undefined && (
              <div className="text-blue-500 text-base font-bold">{report.score}점</div>
            )}

            {/* 구분자 */}
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>

            {/* 리포트 바로가기 */}
            <div className="rounded-[10px] flex items-center gap-2">
              <span className="justify-start text-blue-500 text-sm font-bold">리포트 바로가기</span>
              <Arrow width={18} height={18} strokeWidth={1.67} stroke="#3B82F6" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
