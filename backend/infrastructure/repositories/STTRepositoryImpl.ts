import { STTRepository } from '@/backend/domain/repositories/STTRepository';
import { STTRequest } from '@/backend/domain/dtos/STTRequest';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';
import getOpenAIClient from '@/backend/infrastructure/providers/OpenAIProvider';

export class STTRepositoryImpl implements STTRepository {
  async transcribeToText(audioRequest: STTRequest): Promise<STTResponse> {
    try {
      const client = getOpenAIClient();
      // File 객체 생성
      const audioFile = new File([audioRequest.audioFile], audioRequest.fileName);

      // 음성-텍스트 변환
      const transcription = await client.audio.transcriptions.create({
        file: audioFile,
        model: 'gpt-4o-transcribe',
        ...(audioRequest.language && { language: audioRequest.language }),
        response_format: 'json',
      });
      console.log('✅ OpenAI API 응답 완료');

      return {
        text: transcription.text,
        language: audioRequest.language || 'auto',
      };
    } catch (error) {
      console.error('❌ OpenAI STT Error:', error);

      // 구체적인 에러 메시지 제공
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          throw new Error('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.message.includes('invalid file')) {
          throw new Error('지원하지 않는 오디오 파일 형식입니다.');
        }
      }

      throw new Error(
        `음성-텍스트 변환에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
