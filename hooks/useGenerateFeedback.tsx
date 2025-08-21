import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { DeliverFeedbackDto } from '@/backend/application/feedbacks/dtos/DeliverFeedbackDto';

/**
 * Generate AI feedback for a given report.
 * Calls POST /api/reports/{reportId}/feedback and returns the created feedback.
 */
export const generateFeedback = async (reportId: number): Promise<DeliverFeedbackDto> => {
  const response = await axios.post(`/api/reports/${reportId}/feedback`);
  return response.data;
};

/**
 * React Query mutation hook for generating feedback.
 * Usage:
 * const { mutate, isPending, data, error } = useGenerateFeedback();
 * mutate({ reportId });
 */
export const useGenerateFeedback = () => {
  return useMutation<DeliverFeedbackDto, Error, { reportId: number }>({
    mutationKey: ['generate-feedback'],
    mutationFn: async ({ reportId }) => generateFeedback(reportId),
  });
};
