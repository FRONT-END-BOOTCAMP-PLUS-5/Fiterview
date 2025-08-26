'use client';

import { useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProgressStep } from '@/types/progress';
import { STORAGE_KEYS } from '@/constants/progress';

type Step = ProgressStep;

interface ProgressResponse {
  success: boolean;
  data?: { step: Step; reportId?: number; errorMessage?: string };
}

export function getReportProgressQueryKey(
  jobId?: string | null,
  reportId?: string | null
): (string | null | undefined)[] {
  return ['report-progress', jobId || null, reportId || null];
}

export function useReportProgress(params: {
  enabled: boolean;
  jobId?: string | null;
  reportId?: string | null;
  onJobIdClear?: () => void; // jobId 정리 콜백 추가
}) {
  const { enabled, jobId, reportId, onJobIdClear } = params;
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => getReportProgressQueryKey(jobId, reportId), [jobId, reportId]);

  const { data, isFetching } = useQuery<ProgressResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (jobId) params.set('jobId', jobId);
      if (reportId) params.set('reportId', String(reportId));
      const res = await import('axios').then((axios) =>
        axios.default.get(`/api/reports/progress?${params.toString()}`)
      );
      return res.data;
    },
    enabled: enabled && !!(jobId || reportId),
    refetchInterval: (q) => {
      const step = q.state.data?.data?.step;
      if (!step) return false; // undefined 상태면 폴링 중단

      switch (step) {
        case 'extracting':
          return 250;
        case 'generating':
          return 400;
        case 'saving_questions':
          return 250;
        case 'completed':
        case 'error':
          return false; // 완료/에러 시 폴링 중단
        default:
          return 250; // 기본 간격 (250ms)
      }
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, _error) => {
      const step = (data as any)?.data?.step as string | undefined;
      if (step === 'error') return false;
      return failureCount < 3;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    staleTime: 0,
    gcTime: 1000 * 60 * 2,
  });

  const step: Step | undefined = data?.data?.step;
  const serverReportId = data?.data?.reportId;
  const errorMessage = data?.data?.errorMessage;

  const cancel = () => queryClient.cancelQueries({ queryKey });
  const remove = () => queryClient.removeQueries({ queryKey });

  // error 상태일 때 localStorage에서 jobId 제거
  useEffect(() => {
    if (jobId && typeof window !== 'undefined') {
      const step = data?.data?.step;

      if (step === 'error') {
        window.localStorage.removeItem(STORAGE_KEYS.FITERVIEW_JOB_ID);
        onJobIdClear?.(); // 컴포넌트의 jobId 상태도 null로 설정
      }
    }
  }, [jobId, data?.data?.step, onJobIdClear]);

  return {
    data,
    isFetching,
    step,
    serverReportId,
    errorMessage,
    cancel,
    remove,
    queryKey,
  };
}
