import { useQuery } from '@tanstack/react-query';
import { QuestionTTSResponse } from '@/backend/application/questions/dtos/QuestionTTSResponse';
import axios from 'axios';

/**
 * 면접 질문을 조회하는 훅
 * @returns 질문 목록 조회 결과
 */

const getTtsQuestions = async (reportId: number) => {
  const res = await axios.get(`/api/reports/${reportId}/questions/tts`);
  return res.data;
};

export const useGetTtsQuestions = (reportId: number) => {
  return useQuery<QuestionTTSResponse, Error>({
    queryKey: ['tts-questions', reportId],
    queryFn: () => getTtsQuestions(reportId),
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: Number.isFinite(reportId) && reportId > 0,
  });
};
