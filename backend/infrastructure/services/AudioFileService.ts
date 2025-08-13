import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { FileProcessingService } from './FileProcessingService';

export interface AudioFileInfo {
  filePath: string;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}

export class AudioFileService {
  private static readonly AUDIO_BASE_PATH = 'public/assets/audios';

  /**
   * DB에서 음성 파일명을 조회하고 실제 파일을 읽어옴
   */
  static async getAudioFileFromDB(
    prisma: PrismaClient,
    reportId: number,
    questionOrder: number
  ): Promise<AudioFileInfo> {
    try {
      // 1. DB에서 해당 질문의 녹음 파일명 조회
      const question = await prisma.question.findFirst({
        where: {
          reportId: reportId,
          order: questionOrder,
        },
        select: {
          recording: true,
        },
      });

      if (!question || !question.recording) {
        throw new Error(`질문 ${questionOrder}번의 녹음 파일을 찾을 수 없습니다.`);
      }

      // 2. 파일 경로 구성
      const filePath = join(this.AUDIO_BASE_PATH, reportId.toString(), question.recording);

      // 3. 파일 존재 여부 확인
      if (!existsSync(filePath)) {
        throw new Error(`파일이 존재하지 않습니다: ${filePath}`);
      }

      // 4. 파일 읽기
      const fileBuffer = readFileSync(filePath);

      // 5. MIME 타입 추정
      const mimeType = this.getMimeTypeFromFileName(question.recording);

      return {
        filePath,
        fileName: question.recording,
        fileBuffer,
        mimeType,
      };
    } catch (error) {
      console.error('음성 파일 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 파일명에서 MIME 타입 추정
   */
  private static getMimeTypeFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      webm: 'audio/webm',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      aac: 'audio/aac',
    };

    return mimeTypes[extension || ''] || 'audio/mpeg';
  }
}
