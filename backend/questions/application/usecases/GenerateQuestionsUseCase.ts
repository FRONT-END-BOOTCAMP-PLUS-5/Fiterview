import { QuestionFile, QuestionCreationResult } from '../../domain/entities/Question';
import { QuestionRepository } from '../../domain/repositories/QuestionRepository';

export class GenerateQuestionsUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  // 질문 생성 + DB 저장 (무조건 저장)
  async execute(files: QuestionFile[], reportId: number): Promise<QuestionCreationResult> {
    if (!files || files.length === 0) {
      throw new Error('파일이 필요합니다. 최소 1개 이상의 파일을 업로드해주세요.');
    }

    // 파일 유효성 검사
    this.validateFiles(files);

    // 질문 생성
    const generationResult = await this.questionRepository.generateQuestions(files);

    // 생성된 질문들을 DB에 저장
    return await this.questionRepository.saveQuestions(generationResult.questions, reportId);
  }

  private validateFiles(files: QuestionFile[]): void {
    const maxFileSize = 100 * 1024 * 1024; // 100MB
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];

    for (const file of files) {
      if (file.buffer.length > maxFileSize) {
        throw new Error(`파일 크기가 너무 큽니다: ${file.fileName} (최대 100MB)`);
      }

      const fileExt = file.fileName.toLowerCase().split('.').pop();
      if (!fileExt || !allowedExtensions.includes(`.${fileExt}`)) {
        throw new Error(
          `지원하지 않는 파일 형식: ${file.fileName} (지원 형식: PDF, PNG, JPG, JPEG, WEBP)`
        );
      }
    }
  }
}
