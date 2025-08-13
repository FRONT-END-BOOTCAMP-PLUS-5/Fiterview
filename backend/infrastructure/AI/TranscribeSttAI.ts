import { SttAI } from '@/backend/domain/ai/SttAI';
import { STTRequest } from '@/backend/domain/dtos/STTRequest';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';
import getOpenAIClient from '@/utils/AIs/OpenAI';

export class TranscribeSttAI implements SttAI {
  async transcribeToText(audioRequest: STTRequest): Promise<STTResponse> {
    try {
      // OpenAI 클라이언트 가져오기
      const client = getOpenAIClient();

      // 음성-텍스트 변환
      const transcription = await client.audio.transcriptions.create({
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
