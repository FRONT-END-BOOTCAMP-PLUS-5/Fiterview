import { TTSRequest, TTSResponse } from '@/backend/application/feedbacks/dtos/GenerateSpeechDto';
export interface TTSRepository {
  synthesizeSpeech(request: TTSRequest): Promise<TTSResponse>;
}
