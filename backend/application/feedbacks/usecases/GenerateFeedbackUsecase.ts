import { Feedback } from '@/backend/domain/entities/Feedback';
import { FeedbackRepository } from '@/backend/domain/repositories/FeedbackRepository';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { FeedbackLLMRepository } from '@/backend/domain/AI/openAI/FeedbackLLMRepository';
import { UpdateReportStatusUsecase } from '@/backend/application/reports/usecases/UpdateReportStatusUsecase';

export class GenerateFeedbackUsecase {
  constructor(
    private readonly llmRepository: FeedbackLLMRepository,
    private readonly persistenceRepository: FeedbackRepository,
    private readonly updateReportStatusUsecase: UpdateReportStatusUsecase
  ) {}

  async execute(dto: RequestFeedbackDto): Promise<Feedback> {
    try {
      await this.updateReportStatusUsecase.execute(dto.reportId, 'ANALYZING');
      const evaluation = await this.llmRepository.generateFeedback(dto);
      await this.persistenceRepository.saveFeedback(evaluation);
      await this.updateReportStatusUsecase.execute(dto.reportId, 'COMPLETED');

      return evaluation;
    } catch (error) {
      await this.updateReportStatusUsecase.execute(dto.reportId, 'ANALYZING');
      throw error;
    }
  }
}
