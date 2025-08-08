import { TTSRequest } from '@/backend/application/questions/dtos/TTSRequest';
import { TTSResponse } from '@/backend/application/questions/dtos/TTSResponse';
export interface TTSRepository {
  synthesizeSpeech(request: TTSRequest): Promise<TTSResponse>;
}
