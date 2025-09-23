import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/axiosInstance';

export interface ProceedInterviewLike {
  id: number | string;
  title?: string;
  currentOrder?: number;
}

interface UseProceedInterviewResult {
  isOpen: boolean;
  currentOrder: number;
  selectInterview: (report: ProceedInterviewLike) => void;
  close: () => void;
  resume: () => void;
  restart: () => Promise<void>;
}

export function useProceedInterview(): UseProceedInterviewResult {
  const router = useRouter();
  const [target, setTarget] = useState<ProceedInterviewLike | null>(null);

  const isOpen = !!target;
  const currentOrder = useMemo(() => Number(target?.currentOrder || 1), [target]);

  const selectInterview = useCallback(
    (report: ProceedInterviewLike) => {
      const order = Number(report.currentOrder || 1);
      if (order >= 2) {
        setTarget(report);
      } else {
        router.push(`/interview/${report.id}`);
      }
    },
    [router]
  );

  const close = useCallback(() => setTarget(null), []);

  const resume = useCallback(() => {
    if (!target) return;
    const id = target.id;
    setTarget(null);
    router.push(`/interview/${id}`);
  }, [router, target]);

  const restart = useCallback(async () => {
    if (!target) return;
    const id = target.id;
    try {
      await apiClient.put(`/api/reports/${id}/questions/order`, { currentOrder: 1 });
    } catch {}
    setTarget(null);
    router.push(`/interview/${id}`);
  }, [router, target]);

  return { isOpen, currentOrder, selectInterview, close, resume, restart };
}
