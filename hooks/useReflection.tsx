import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Report {
  id: number;
  reflection: string | null;
}

export default function useReflection({ reportId }: { reportId: number }) {
  const queryClient = useQueryClient();

  // fetch reflection
  const reportQuery = useQuery<Report>({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const response = await axios.get(`/api/reports/${reportId}/reflection`);
      return response.data;
    },
  });
  // update reflection
  const saveMutation = useMutation({
    mutationFn: async (reflection: string) => {
      const res = await axios.patch(`/api/reports/${reportId}/reflection`, {
        reflection,
      });
      if (res.status === 200) {
        return res.data as Promise<Report>;
      }
      throw new Error('Failed to update reflection');
    },
    onMutate: async (reflection: string) => {
      await queryClient.cancelQueries({ queryKey: ['report', reportId] });
      const previous = queryClient.getQueryData<Report>(['report', reportId]);
      queryClient.setQueryData<Report>(['report', reportId], (curr) =>
        curr ? { ...curr, reflection } : (previous ?? undefined)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData<Report>(['report', reportId], ctx.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Report>(['report', reportId], updated);
    },
  });

  return { reportQuery, saveMutation };
}
