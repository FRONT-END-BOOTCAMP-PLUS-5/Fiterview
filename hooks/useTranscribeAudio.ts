import axios from 'axios';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';

interface TranscribeAudioParams {
  reportId: number;
  order: number;
}

interface TranscribeAudioResponse {
  success: boolean;
  data?: {
    message: string;
    timestamp: string;
    reportId: number;
    order: number;
    transcription: STTResponse;
  };
  error?: string;
}

/**
 * @param params reportId와 order
 * @returns STT 처리 결과
 */
export const transcribeAudio = async ({
  reportId,
  order,
}: TranscribeAudioParams): Promise<TranscribeAudioResponse> => {
  const response = await axios.post(`/api/reports/${reportId}/questions/${order}/transcribe`);
  return response.data;
};
