'use client';

import { useRouter } from 'next/navigation';
import { NoneReports } from '@/app/(anon)/interview/components/NoneReports';
import { LoadingSpinner } from '@/app/(anon)/components/loading/LoadingSpinner';
import Arrow from '@/public/assets/icons/arrow-right.svg';

type PendingReport = {
  id: number;
  title: string;
};

interface PendingInterviewsListProps {
  reports: PendingReport[];
  loading: boolean;
}

export default function PendingInterviewsList({ reports, loading }: PendingInterviewsListProps) {
  const router = useRouter();
  return (
    <section className="flex-1 self-stretch inline-flex flex-col justify-start items-start">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="justify-start text-[#1E293B] text-[20px] font-semibold">나의 대기 면접</h2>
      </div>

      <div className="h-full w-full flex flex-col justify-start items-start gap-4 overflow-y-auto max-h-[630px]">
        {loading ? (
          <LoadingSpinner
            size="medium"
            message="대기 면접을 불러오는 중..."
            className="self-stretch justify-center items-center h-full"
          />
        ) : reports.length === 0 ? (
          <NoneReports />
        ) : (
          reports.map((report) => (
            <div
              key={`pending-report-${report.id}`}
              className="self-stretch h-20 p-6 rounded-xl outline-1 outline-offset-[-1px] outline-slate-200 flex justify-between items-center cursor-pointer
                         bg-gradient-to-r from-white/30 via-blue-300/10 to-blue-500/25
                         bg-[length:150%_100%] bg-[position:0%_0%]
                         hover:bg-[position:100%_0%]
                         transition-[background-position] duration-700 ease-out"
              onClick={() => router.push(`/interview/${report.id}`)}
            >
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                <span className="justify-start text-slate-800 text-base font-semibold">
                  {report.title}
                </span>
              </div>
              <div className="rounded-[10px] flex items-center gap-2">
                <Arrow width={18} height={18} strokeWidth={1.67} stroke="#3B82F6" />
                <span className="justify-start text-blue-500 text-sm font-semibold">시작</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
