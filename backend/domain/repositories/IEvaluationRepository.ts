import { Evaluation } from '@/backend/domain/entities/Evaluation';
import { GenerateEvaluationDto } from '@/backend/application/evaluations/dtos/GenerateEvaluationDto';

export interface IEvaluationRepository {
  generateResponse(dto: GenerateEvaluationDto): Promise<Evaluation>;
}
