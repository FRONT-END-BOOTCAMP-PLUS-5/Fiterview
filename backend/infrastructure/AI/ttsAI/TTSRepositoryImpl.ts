import { TTSRequest } from '@/backend/domain/dtos/TTSRequest';
import { TTSResponse } from '@/backend/domain/dtos/TTSResponse';
import { TTSRepository } from '../../../domain/AI/ttsAI/TTSRepository';
import client from '@/utils/AI/TTSAI';

export class PrTTSRepository implements TTSRepository {
  // 텍스트를 음성으로 변환
  async synthesizeSpeech(speechRequest: TTSRequest): Promise<TTSResponse> {
    try {
      // TTS 요청 구성
      const request = {
        input: { text: speechRequest.text },
        voice: {
          languageCode: 'ko-KR',
          name: speechRequest.voice || 'ko-KR-Neural2-A',
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 1.0,
          pitch: 0,
        },
      };

      // TTS 요청 실행
      const [response] = await client.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('오디오 콘텐츠가 생성되지 않았습니다.');
      }

      // Buffer로 변환하여 반환
      const buffer = Buffer.from(response.audioContent);
      return { audio: buffer };
    } catch (error) {
      console.error('Google Cloud TTS Error:', error);
      throw new Error(
        `TTS 생성에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
