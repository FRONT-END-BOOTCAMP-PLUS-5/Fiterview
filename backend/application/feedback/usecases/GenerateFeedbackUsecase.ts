import { Feedback } from '@/backend/domain/entities/Feedback';
import { IFeedbackRepository } from '@/backend/domain/repositories/IFeedbackRepository';
import { RequestFeedbackDto } from '@/backend/application/feedback/dtos/RequestFeedbackDto';
import { FeedbackLLMRepository } from '@/backend/domain/repositories/FeedbackLLMRepository';

export class GenerateFeedbackUsecase {
  constructor(
    private readonly llmRepository: FeedbackLLMRepository,
    private readonly persistenceRepository: IFeedbackRepository
  ) {}

  async execute(dto: RequestFeedbackDto): Promise<Feedback> {
    const evaluation = await this.llmRepository.generateFeedback(dto);
    await this.persistenceRepository.saveFeedback(evaluation);
    return evaluation;
  }
}
