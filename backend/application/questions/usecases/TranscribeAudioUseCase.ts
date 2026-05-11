import { SttAI } from '@/backend/domain/AI/SttAI';
import { STTRequest } from '@/backend/domain/dtos/STTRequest';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';
import { CleanTranscriptionService } from '@/backend/application/questions/services/CleanTranscriptionService';
import { STT_PROMPT_BIAS } from '@/constants/stt';

export interface TranscribeAudioResult {
  raw: STTResponse;
  cleanText: string;
}

export class TranscribeAudioUseCase {
  constructor(
    private readonly sttRepository: SttAI,
    private readonly cleanService: CleanTranscriptionService
  ) {}

  async execute(
    audioFile: Buffer,
    fileName: string,
    language: string
  ): Promise<TranscribeAudioResult> {
    try {
      const sttRequest: STTRequest = {
        audioFile,
        fileName,
        language,
        prompt: STT_PROMPT_BIAS,
      };

      const raw = await this.sttRepository.transcribeToText(sttRequest);
      const cleanText = this.cleanService.clean(raw.text);

      return { raw, cleanText };
    } catch (error) {
      console.error('STT 처리 실패:', error);
      throw error;
    }
  }
}
