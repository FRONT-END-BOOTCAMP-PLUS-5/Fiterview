import { Feedback } from '@/backend/domain/entities/Feedback';
import { FeedbackRepository } from '@/backend/domain/repositories/FeedbackRepository';
import { RequestFeedbackDto } from '@/backend/application/feedbacks/dtos/RequestFeedbackDto';
import { FeedbackLLMRepository } from '@/backend/domain/repositories/FeedbackLLMRepository';

export class GenerateFeedbackUsecase {
  constructor(
    private readonly llmRepository: FeedbackLLMRepository,
    private readonly persistenceRepository: FeedbackRepository
  ) {}

  async execute(dto: RequestFeedbackDto): Promise<Feedback> {
    const evaluation = await this.llmRepository.generateFeedback(dto);
    await this.persistenceRepository.saveFeedback(evaluation);
    return evaluation;
  }
}
