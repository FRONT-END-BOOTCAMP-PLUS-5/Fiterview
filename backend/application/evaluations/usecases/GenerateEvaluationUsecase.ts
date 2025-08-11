import { Evaluation } from '@/backend/domain/entities/Evaluation';
import { IEvaluationRepository } from '@/backend/domain/repositories/IEvaluationRepository';
import { GenerateEvaluationDto } from '@/backend/application/evaluations/dtos/GenerateEvaluationDto';

export class GenerateEvaluationUsecase {
  constructor(private readonly evaluationRepository: IEvaluationRepository) {}

  async execute(dto: GenerateEvaluationDto): Promise<Evaluation> {
    const evaluation = await this.evaluationRepository.generateResponse(dto);
    return evaluation;
  }
}
