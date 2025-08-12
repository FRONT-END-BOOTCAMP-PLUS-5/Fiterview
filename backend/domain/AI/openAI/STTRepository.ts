import { STTRequest } from '@/backend/domain/dtos/STTRequest';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';

export interface STTRepository {
  transcribeToText(audioRequest: STTRequest): Promise<STTResponse>;
}
