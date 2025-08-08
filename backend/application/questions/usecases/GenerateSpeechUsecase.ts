import { TTSRequest } from '../dtos/TTSRequest';
import { TTSResponse } from '../dtos/TTSResponse';
import { TTSRepository } from '../../../domain/repositories/TTSRepository';

export class GenerateSpeechUsecase {
  constructor(private ttsRepository: TTSRepository) {}

  async execute(request: TTSRequest): Promise<TTSResponse> {
    // TTS 생성
    return await this.ttsRepository.synthesizeSpeech(request);
  }
}
