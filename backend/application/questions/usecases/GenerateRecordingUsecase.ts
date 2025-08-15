import { QuestionRepository } from '@/backend/domain/repositories/QuestionRepository';
import { RecordingRequest } from '@/backend/application/questions/dtos/RecordingRequest';
import { RecordingResponse } from '@/backend/application/questions/dtos/RecordingResponse';
import fs from 'fs/promises';
import path from 'path';
import { extension } from 'mime-types';

export class GenerateRecordingUsecase {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(request: RecordingRequest): Promise<RecordingResponse> {
    const { reportId, order, audioBuffer, contentType } = request;

    // 확장자 계산 (기본 mp3)
    const ext = (contentType && (extension(contentType) as string)) || 'mp3';
    const originalName = `recording_${reportId}_${order}.${ext}`;
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // 저장 경로: public/assets/audios
    const publicDir = path.join(process.cwd(), 'public', 'assets', 'audios', String(reportId));
    const fullPath = path.join(publicDir, safeName);

    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(fullPath, audioBuffer);

    // DB에는 파일명만 저장
    await this.questionRepository.generateRecording(reportId, order, safeName);

    return {
      success: true,
      order,
      filePath: safeName,
      message: '녹음본이 성공적으로 저장되었습니다.',
    };
  }
}
