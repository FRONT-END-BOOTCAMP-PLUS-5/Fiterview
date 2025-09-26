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
  proceed: () => void;
  restart: () => Promise<void>;
}

// 인터뷰 재시작 모달 훅(currentOrder가 2이상인 경우만 모달 오픈)
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

  // 이어서 하기 버튼 선택 시
  const proceed = useCallback(() => {
    if (!target) return;
    const id = target.id;
    setTarget(null);
    router.push(`/interview/${id}`);
  }, [router, target]);

  // 처음부터 시작 버튼 선택 시
  const restart = useCallback(async () => {
    if (!target) return;
    const id = target.id;
    try {
      await apiClient.put(`/api/reports/${id}/questions/order`, { currentOrder: 1 });
    } catch {}
    setTarget(null);
    router.push(`/interview/${id}`);
  }, [router, target]);

  return { isOpen, currentOrder, selectInterview, close, proceed, restart };
}
