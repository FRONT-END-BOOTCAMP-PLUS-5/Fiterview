import { STTRepository } from '@/backend/domain/repositories/STTRepository';
import { STTRequest } from '@/backend/domain/dtos/STTRequest';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';
import { OpenAIProvider } from '../providers/OpenAIProvider';

export class STTRepositoryImpl implements STTRepository {
  private openaiProvider: OpenAIProvider;

  constructor() {
    this.openaiProvider = new OpenAIProvider();
  }

  async transcribeToText(audioRequest: STTRequest): Promise<STTResponse> {
    try {
      const openai = this.openaiProvider.getClient();

      // OpenAI API 호출하여 음성-텍스트 변환
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioRequest.audioFile], audioRequest.fileName),
        model: 'gpt-4o-transcribe',
        ...(audioRequest.language && { language: audioRequest.language }),
        response_format: 'json',
      });

      return {
        text: transcription.text,
        language: audioRequest.language || 'auto',
      };
    } catch (error) {
      console.error('OpenAI STT Error:', error);
      throw new Error(
        `음성-텍스트 변환에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
