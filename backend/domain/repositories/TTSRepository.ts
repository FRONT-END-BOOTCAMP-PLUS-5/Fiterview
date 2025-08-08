import { TTSRequest, TTSResponse } from '@/backend/application/questions/dtos/GenerateSpeechDto';
export interface TTSRepository {
  synthesizeSpeech(request: TTSRequest): Promise<TTSResponse>;
}
