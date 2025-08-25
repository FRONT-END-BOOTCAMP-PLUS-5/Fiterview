'use client';

import { useRouter } from 'next/navigation';
import { NoneReports } from '@/app/(anon)/interview/components/NoneReports';
import { LoadingSpinner } from '@/app/(anon)/components/loading/LoadingSpinner';
import ReportCard from '@/app/(anon)/interview/components/ReportCard';

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

      <div className="h-full w-full flex flex-col justify-start items-start gap-4 overflow-y-auto">
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
            <ReportCard key={`pending-report-${report.id}`} report={report} />
          ))
        )}
      </div>
    </section>
  );
}
