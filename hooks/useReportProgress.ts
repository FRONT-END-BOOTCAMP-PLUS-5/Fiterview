'use client';

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type Step =
  | 'started'
  | 'extracting'
  | 'generating'
  | 'creating_report'
  | 'saving_questions'
  | 'completed'
  | 'error';

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
}) {
  const { enabled, jobId, reportId } = params;
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
    enabled,
    refetchInterval: (q) => {
      const step = q.state.data?.data?.step;
      if (!step) return 250;
      return step === 'completed' || step === 'error' ? false : 250;
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
