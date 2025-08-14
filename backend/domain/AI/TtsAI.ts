import { TTSRequest } from '@/backend/domain/dtos/TTSRequest';
import { TTSResponse } from '@/backend/domain/dtos/TTSResponse';

export interface TtsAI {
  synthesizeSpeech(request: TTSRequest): Promise<TTSResponse>;
}
