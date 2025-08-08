import { TTSRequest, TTSResponse } from '../dtos/GenerateSpeechDto';
import { TTSRepository } from '../../../domain/repositories/TTSRepository';

export class GenerateSpeechUsecase {
  constructor(private ttsRepository: TTSRepository) {}

  async execute(request: TTSRequest): Promise<TTSResponse> {
    // TTS 생성
    return await this.ttsRepository.synthesizeSpeech(request);
  }
}
