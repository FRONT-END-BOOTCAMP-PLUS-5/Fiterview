import { EvaluationEntity } from '@/backend/domain/entities/EvaluationEntity';
import { GenerateEvaluationDto } from '@/backend/application/evaluations/dtos/GenerateEvaluationDto';

export interface IEvaluationRepository {
  generateResponse(dto: GenerateEvaluationDto): Promise<EvaluationEntity>;
}
