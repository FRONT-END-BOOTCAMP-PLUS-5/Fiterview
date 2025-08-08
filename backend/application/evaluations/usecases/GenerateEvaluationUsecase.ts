import { EvaluationEntity } from '@/backend/domain/entities/EvaluationEntity';
import { IEvaluationRepository } from '@/backend/domain/repositories/IEvaluationRepository';
import { GenerateEvaluationDto } from '@/backend/application/evaluations/dtos/GenerateEvaluationDto';
import { DeliverEvaluationDto } from '@/backend/application/evaluations/dtos/DeliverEvaluationDto';

export class GenerateEvaluationUsecase {
  constructor(private readonly evaluationRepository: IEvaluationRepository) {}

  async execute(dto: GenerateEvaluationDto): Promise<EvaluationEntity> {
    const evaluation = await this.evaluationRepository.generateEvaluation(dto);
    return new DeliverEvaluationDto(evaluation.evaluation_report_id, evaluation.score);
  }
}
