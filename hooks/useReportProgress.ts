'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProgressStep } from '@/types/progress';
import { STORAGE_KEYS } from '@/constants/progress';

type ProgressStatus = ProgressStep;

interface ProgressResponse {
  success: boolean;
  data: {
    step: ProgressStatus;
    reportId: number;
    errorMessage: string;
  };
}

export function useReportProgress(params: {
  enabled: boolean;
  jobId: string | null;
  reportId: string | null;
  onJobIdClear: () => void;
}) {
  const { enabled, jobId, reportId, onJobIdClear } = params;

  const [progress, setProgress] = useState<ProgressResponse | undefined>(undefined);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const sseUrl = useMemo(() => {
    const paramsObj = new URLSearchParams();
    if (jobId) paramsObj.set('jobId', jobId);
    if (reportId) paramsObj.set('reportId', String(reportId));
    return `/api/reports/progress?${paramsObj.toString()}`;
  }, [jobId, reportId]);

  // SSE 연결 및 메시지 수신 관리
  useEffect(() => {
    if (!enabled || (!jobId && !reportId)) return;

    const eventSource = new EventSource(sseUrl, { withCredentials: false });
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('open', () => {
      setConnected(true);
    });

    eventSource.addEventListener('message', (evt) => {
      try {
        const parsed: ProgressResponse = JSON.parse(evt.data);
        setProgress(parsed);
      } catch {}
    });

    eventSource.addEventListener('end', () => {
      eventSource.close();
      setConnected(false);
    });
    eventSource.addEventListener('error', () => {
      setConnected(false);
      eventSource.close();
    });

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [enabled, sseUrl, jobId, reportId]);

  const progressStep: ProgressStatus | undefined = progress?.data?.step;
  const receivedReportId = progress?.data?.reportId;
  const receivedErrorMessage = progress?.data?.errorMessage;

  // 에러 발생 -> JobID 클리어 및 콜백 실행
  useEffect(() => {
    if (jobId && progressStep === 'error' && typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEYS.FITERVIEW_JOB_ID);
      onJobIdClear?.();
    }
  }, [jobId, progressStep, onJobIdClear]);

  const cancel = () => {
    eventSourceRef.current?.close();
  };

  const remove = () => {
    setProgress(undefined);
  };

  return {
    progress,
    isFetching: connected,
    step: progressStep,
    serverReportId: receivedReportId,
    errorMessage: receivedErrorMessage,
    cancel,
    remove,
  };
}
