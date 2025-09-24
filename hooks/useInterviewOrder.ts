import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/axiosInstance';

const queryKey = (reportId: number) => ['interview-order', reportId] as const;

export function useInterviewOrder(reportId: number | undefined) {
  const qc = useQueryClient();

  const orderQuery = useQuery({
    queryKey: reportId ? queryKey(reportId) : ['interview-order', 'noop'],
    queryFn: async () => {
      if (!reportId) return 1;
      const res = await apiClient.get(`/api/reports/${reportId}/questions/order`);
      const value = Number(res?.data?.data?.currentOrder ?? 1);
      return Number.isFinite(value) && value >= 1 ? value : 1;
    },
    enabled: !!reportId,
    staleTime: 0,
  });

  const updateMutation = useMutation({
    mutationFn: async (nextOrder: number) => {
      if (!reportId) return;
      await apiClient.put(`/api/reports/${reportId}/questions/order`, { currentOrder: nextOrder });
      return nextOrder;
    },
    onSuccess: (nextOrder) => {
      if (!reportId || typeof nextOrder !== 'number') return;
      qc.setQueryData(queryKey(reportId), nextOrder);
    },
  });

  return {
    orderQuery,
    updateOrder: updateMutation.mutateAsync,
  };
}
