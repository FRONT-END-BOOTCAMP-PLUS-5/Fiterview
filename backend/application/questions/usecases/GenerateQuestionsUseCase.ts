import { QuestionsRequest } from '@/backend/domain/dtos/QuestionsRequest';
import { SavedQuestionsDto } from '@/backend/application/questions/dtos/SavedQuestionsDto';
import { GenerateQuestionRepository } from '@/backend/domain/AI/googleAI/GenerateQuestionRepository';
export class GenerateQuestionsUseCase {
  constructor(private questionRepository: GenerateQuestionRepository) {}

  async execute(files: QuestionsRequest[], reportId: number): Promise<SavedQuestionsDto> {
    if (!files || files.length === 0) {
      throw new Error('파일이 필요합니다. 최소 1개 이상의 파일을 업로드해주세요.');
    }

    const maxFileSize = 100 * 1024 * 1024;
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
    for (const file of files) {
      if (file.bytes.byteLength > maxFileSize) {
        throw new Error(`파일 크기가 너무 큽니다: ${file.fileName} (최대 100MB)`);
      }
      const fileExt = file.fileName.toLowerCase().split('.').pop();
      if (!fileExt || !allowedExtensions.includes(`.${fileExt}`)) {
        throw new Error(
          `지원하지 않는 파일 형식: ${file.fileName} (지원 형식: PDF, PNG, JPG, JPEG, WEBP)`
        );
      }
    }

    const generatedQuestions = await this.questionRepository.generateQuestions(files);

    const savedQuestions = await this.questionRepository.saveQuestions(
      generatedQuestions,
      reportId
    );

    return { questions: savedQuestions, reportId };
  }
}
