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

    // 1) 파일 경로 생성
    const ext = (contentType && extension(contentType)) || 'wav';
    const fileName = `question_${order}_${Date.now()}.${ext}`;
    const relativeDir = path.join('uploads', 'recordings', String(reportId));
    const relativePath = path.join(relativeDir, fileName);
    const fullPath = path.join(process.cwd(), relativePath);

    // 2) 디렉토리 생성 및 파일 저장
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, audioBuffer);

    // 3) DB 업데이트
    await this.questionRepository.generateRecording(reportId, order, relativePath);

    return {
      success: true,
      order,
      filePath: relativePath,
      message: '녹음본이 성공적으로 저장되었습니다.',
    };
  }
}
