import { NextRequest } from 'next/server';
import { FileProcessingService } from './FileProcessingService';

export interface ExtractedRequestData {
  audioFile: File;
  language: string;
}

export class RequestDataService {
  /**
   * 요청 데이터 추출 및 처리
   */
  static async extractRequestData(
    request: NextRequest,
    orderNumber: number
  ): Promise<ExtractedRequestData> {
    let audioFile: File;
    let language = 'ko';

    // FormData 처리
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      audioFile = formData.get('audio') as File;
      language = (formData.get('language') as string) || 'ko';

      if (!audioFile) {
        throw new Error('오디오 파일이 누락되었습니다.');
      }
    } else {
      // JSON 처리 (하위 호환성)
      const body = await request.json();
      const { audio: audioData, language: lang = 'ko' } = body;
      language = lang;

      if (!audioData) {
        throw new Error('오디오 데이터가 누락되었습니다.');
      }

      // base64 문자열을 Buffer로 변환
      const audioBuffer = Buffer.from(audioData, 'base64');
      audioFile = new File([audioBuffer], `question_${orderNumber}.mp3`, {
        type: 'audio/mp3',
      });
    }

    return { audioFile, language };
  }
}
