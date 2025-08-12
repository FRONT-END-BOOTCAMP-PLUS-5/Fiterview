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

    // 1) 파일명 및 경로 구성 (question{order}.{ext})
    let ext = (contentType && extension(contentType)) || 'wav';
    // 확장자 변환 (weba -> webm)
    // if (ext === 'weba') {
    //   ext = 'webm';
    // }
    const fileName = `question${order}.${ext}`;

    const publicDir = path.join(process.cwd(), 'public', 'assets', 'audios', String(reportId));
    const fullPath = path.join(publicDir, fileName);

    // 2) 디렉토리 생성 및 파일 저장 (public/assets/audios/{reportId} 하위)
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(fullPath, audioBuffer);

    // 3) DB에는 파일명만 저장
    await this.questionRepository.generateRecording(reportId, order, fileName);

    return {
      success: true,
      order,
      filePath: fileName,
      message: '녹음본이 성공적으로 저장되었습니다.',
    };
  }
}
