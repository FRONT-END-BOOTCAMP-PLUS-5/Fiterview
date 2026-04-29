import { QuestionRepository } from '@/backend/domain/repositories/QuestionRepository';
import { RecordingRequest } from '@/backend/application/questions/dtos/RecordingRequest';
import { RecordingResponse } from '@/backend/application/questions/dtos/RecordingResponse';
import fs from 'fs/promises';
import path from 'path';
import { extension } from 'mime-types';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/r2/client';

export class GenerateRecordingUsecase {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(request: RecordingRequest): Promise<RecordingResponse> {
    const { reportId, order, audioBuffer, contentType } = request;

    // 확장자 계산 (기본 mp3)
    const ext = (contentType && (extension(contentType) as string)) || 'mp3';
    const originalName = `recording_${reportId}_${order}.${ext}`;
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // 저장 경로: 1번 레포트의 1번 질문 녹음본 -> 1/recording_1_1.mp3
    const publicDir = path.join(process.cwd(), 'public', 'assets', 'audios', String(reportId));
    const fullPath = path.join(publicDir, safeName);
    const r2Dir = `${reportId}/${safeName}`;

    try {
      // R2에 파일 업로드
      await r2Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: r2Dir,
          Body: audioBuffer,
          ContentType: contentType,
        })
      );
    } catch (error) {
      console.error('R2 업로드 오류:', error);
      throw new Error('녹음본 저장에 실패했습니다. 다시 시도해주세요.');
    }

    // DB에는 파일명만 저장
    // await this.questionRepository.generateRecording(reportId, order, safeName);

    return {
      success: true,
      order,
      filePath: safeName,
      message: '녹음본이 성공적으로 저장되었습니다.',
    };
  }
}
