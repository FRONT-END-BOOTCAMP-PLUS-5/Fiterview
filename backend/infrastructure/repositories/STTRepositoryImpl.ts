import { STTRepository } from '../../domain/repositories/STTRepository';
import { STTRequest } from '../../domain/dtos/STTRequest';
import { STTResponse } from '../../domain/dtos/STTResponse';
import { OpenAIProvider } from '../providers/OpenAIProvider';

export class STTRepositoryImpl implements STTRepository {
  private openaiProvider: OpenAIProvider;

  constructor() {
    this.openaiProvider = new OpenAIProvider();
  }

  async transcribe(request: STTRequest): Promise<STTResponse> {
    const openai = this.openaiProvider.getClient();

    // OpenAI API 호출하여 음성-텍스트 변환
    const transcription = await openai.audio.transcriptions.create({
      file: new File([request.audioFile], request.fileName),
      model: 'gpt-4o-transcribe',
      ...(request.language && { language: request.language }),
      response_format: 'json',
    });

    // 응답 처리 및 반환
    return {
      text: transcription.text,
      language: request.language || 'auto',
    };
  }
}
