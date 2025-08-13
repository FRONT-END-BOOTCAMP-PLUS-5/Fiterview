import { Feedback } from '@/backend/domain/entities/Feedback';
import { FeedbackRepository } from '@/backend/domain/repositories/FeedbackRepository';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { FeedbackLLMRepository } from '@/backend/domain/AI/openAI/FeedbackLLMRepository';
import { ReportRepository } from '@/backend/domain/repositories/ReportRepository';

export class GenerateFeedbackUsecase {
  constructor(
    private readonly llmRepository: FeedbackLLMRepository,
    private readonly persistenceRepository: FeedbackRepository,
    private readonly reportRepository: ReportRepository
  ) {}

  async execute(dto: RequestFeedbackDto): Promise<Feedback> {
    try {
      await this.reportRepository.updateReportStatus(dto.reportId, 'ANALYZING');
      const evaluation = await this.llmRepository.generateFeedback(dto);
      await this.persistenceRepository.saveFeedback(evaluation);
      await this.reportRepository.updateReportStatus(dto.reportId, 'COMPLETED');

      return evaluation;
    } catch (error) {
      await this.reportRepository.updateReportStatus(dto.reportId, 'ANALYZING');
      throw error;
    }
  }
}
