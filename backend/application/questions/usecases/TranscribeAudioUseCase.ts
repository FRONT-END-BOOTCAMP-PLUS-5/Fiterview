import { STTRepository } from '@/backend/domain/repositories/STTRepository';
import { STTRequest } from '@/backend/domain/dtos/STTRequest';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';

export class TranscribeAudioUseCase {
  constructor(private readonly sttRepository: STTRepository) {}

  async execute(audioFile: Buffer, fileName: string, language: string): Promise<STTResponse> {
    try {
      // STTRequest 객체 생성
      const sttRequest: STTRequest = {
        audioFile,
        fileName,
        language,
      };

      // STT 처리
      const transcription = await this.sttRepository.transcribeToText(sttRequest);

      return transcription;
    } catch (error) {
      console.error('❌ STT 처리 실패:', error);
      throw error;
    }
  }
}
