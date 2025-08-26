'use client';

import { useState, useMemo } from 'react';
import ReportDetailCard from '@/app/(anon)/reports/components/ReportDetailCard';
import XCircle from '@/public/assets/icons/x-circle.svg';
import { usePagination } from '@/hooks/usePagination';
import { LoadingSpinner } from '@/app/components/loading/LoadingSpinner';

interface ReportsListProps {
  reports: any[];
  loading: boolean;
}

export default function ReportsList({ reports, loading }: ReportsListProps) {
  const [sortBy, setSortBy] = useState<'created' | 'completed' | null>(null);

  // 정렬된 리포트 목록 생성
  const sortedReports = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    const reportsCopy = [...reports];

    switch (sortBy) {
      case 'completed':
        // 면접순: 면접 완료된 것과 분석중인 것만 필터링하고 최신 순으로 정렬
        const completedReports = reportsCopy.filter(
          (report) => report.status === 'COMPLETED' || report.status === 'ANALYZING'
        );
        return completedReports.sort((a, b) => {
          // completedAt이 있으면 그것을 기준으로, 없으면 createdAt 기준
          const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.createdAt);
          const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

      case 'created':
        // 질문순: 면접 완료된 것과 분석중인 것 제외하고 최신 생성 순으로 정렬
        const pendingReports = reportsCopy.filter(
          (report) => report.status !== 'COMPLETED' && report.status !== 'ANALYZING'
        );
        return pendingReports.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

      default:
        // 기본값: 최신 생성 순으로 정렬 (전체 리포트)
        return reportsCopy.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
    }
  }, [reports, sortBy]);

  // 정렬 옵션 토글 함수
  const handleSortToggle = (option: 'created' | 'completed') => {
    if (sortBy === option) {
      // 같은 옵션을 다시 클릭하면 선택 해제
      setSortBy(null);
    } else {
      // 다른 옵션 선택
      setSortBy(option);
    }
  };

  const {
    currentPage,
    totalPages,
    currentItems: currentReports,
    pageNumbers,
    handlePageChange,
    hasNextPage,
    hasPrevPage,
  } = usePagination(sortedReports, {
    totalItems: sortedReports.length,
    itemsPerPage: 8,
  });

  if (loading) {
    return (
      <div className="w-[933px] h-[1120px] flex flex-col justify-start items-start gap-4">
        <div className="self-stretch inline-flex justify-start items-center gap-4">
          <div className="flex-1 justify-start text-zinc-800 text-lg font-black leading-snug">
            <div className="flex items-center justify-center gap-2 w-full h-full">
              <LoadingSpinner size="small" message="면접 기록을 불러오는 중" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[933px] h-full flex flex-col justify-start items-start gap-10">
      {/* 헤더 부분 - 리포트 개수와 관계없이 동일하게 표시 */}
      <div className="self-stretch inline-flex justify-start items-center gap-4">
        <div className="flex-1 justify-start text-zinc-800 text-lg font-black leading-snug">
          총 {sortBy === null ? reports.length : sortedReports.length}개의 면접 기록
        </div>
        {reports.length > 0 && (
          <div className="flex justify-start items-center gap-3">
            <div className="bg-slate-100 rounded-lg flex justify-start items-start gap-0.5">
              <button
                className={`h-8 px-3 rounded-md flex justify-center items-center cursor-pointer ${
                  sortBy === 'created'
                    ? 'bg-white outline outline-1 outline-offset-[-1px] outline-slate-200'
                    : ''
                }`}
                onClick={() => handleSortToggle('created')}
              >
                <div
                  className={`text-sm font-medium leading-none ${
                    sortBy === 'created' ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  질문순
                </div>
              </button>
              <button
                className={`h-8 px-3 rounded-md flex justify-center items-center cursor-pointer ${
                  sortBy === 'completed'
                    ? 'bg-white outline outline-1 outline-offset-[-1px] outline-slate-200'
                    : ''
                }`}
                onClick={() => handleSortToggle('completed')}
              >
                <div
                  className={`text-sm font-medium leading-none ${
                    sortBy === 'completed' ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  면접순
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 리포트 개수에 따라 다른 내용 렌더링 */}
      {reports.length === 0 ? (
        // Empty 상태
        <div className="self-stretch flex flex-col justify-center items-center gap-4 py-10">
          <div className="w-20 h-20 bg-slate-50 rounded-[40px] inline-flex justify-center items-center">
            <XCircle width={48} height={48} stroke="#CBD5E1" strokeWidth={3.3} />
          </div>
          <div className="flex flex-col justify-start items-center gap-3">
            <div className="text-center justify-start text-slate-800 text-lg font-semibold leading-snug">
              생성된 면접이 없습니다
            </div>
            <div className="text-center justify-start text-slate-500 text-sm font-normal leading-tight">
              포트폴리오를 업로드하고 맞춤형 면접을 생성해보세요
            </div>
          </div>
        </div>
      ) : (
        // 리포트 목록과 페이지네이션
        <>
          <div className="min-h-[400px] max-h-[830px] w-full flex flex-col justify-between">
            <div className="self-stretch flex flex-col gap-4 h-full">
              {currentReports.map((report) => (
                <ReportDetailCard key={`report-${report.id}`} report={report} />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 0 && (
              <div className="mt-10 self-stretch flex justify-center items-center gap-2">
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
        </>
      )}
    </div>
  );
}
