import { Question } from '@/backend/domain/entities/Question';
import { QuestionRepository } from '@/backend/domain/repositories/QuestionRepository';

export class GetQuestionsUsecase {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(reportId: number): Promise<Question[]> {
    if (reportId === null || reportId === undefined || Number.isNaN(reportId)) {
      throw new Error('유효한 reportId가 필요합니다.');
    }

    return this.questionRepository.findAllByReportId(reportId);
  }
}
