import { STTRequest } from '@/backend/domain/dtos/STTRequest';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';

export interface SttAI {
  transcribeToText(audioRequest: STTRequest): Promise<STTResponse>;
}
