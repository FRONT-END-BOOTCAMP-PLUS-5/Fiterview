'use client';

import { useRouter } from 'next/navigation';
import { NoneReports } from '@/app/(anon)/interview/components/NoneReports';
import { LoadingSpinner } from '@/app/components/loading/LoadingSpinner';
import ReportCard from '@/app/(anon)/interview/components/ReportCard';
import { usePagination } from '@/hooks/usePagination';

type PendingReport = {
  id: number;
  title: string;
};

interface PendingInterviewsListProps {
  reports: PendingReport[];
  loading: boolean;
}

export default function PendingInterviewsList({ reports, loading }: PendingInterviewsListProps) {
  // 페이지네이션 설정: 페이지당 6개씩
  const {
    currentPage,
    totalPages,
    currentItems,
    pageNumbers,
    handlePageChange,
    hasNextPage,
    hasPrevPage,
  } = usePagination(reports, {
    totalItems: reports.length,
    itemsPerPage: 6,
    maxVisiblePages: 5,
  });

  return (
    <section className="flex-1 self-stretch inline-flex flex-col justify-start items-start">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="justify-start text-[#1E293B] text-[20px] font-semibold">나의 대기 면접</h2>
      </div>

      <div className="h-full w-full flex flex-col justify-between">
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
            currentItems.map((report) => (
              <ReportCard key={`pending-report-${report.id}`} report={report} />
            ))
          )}
        </div>
        {totalPages > 0 && (
          <div className="self-stretch flex justify-center items-center gap-2">
            {/* 이전 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                !hasPrevPage
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              이전
            </button>

            {/* 페이지 번호들 */}
            {pageNumbers.map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  page === currentPage
                    ? 'bg-blue-500 text-white'
                    : page === '...'
                      ? 'text-slate-400 cursor-default'
                      : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                {page}
              </button>
            ))}

            {/* 다음 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                !hasNextPage
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
