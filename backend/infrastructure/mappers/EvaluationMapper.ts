import { EvaluationEntity } from '@/backend/domain/entities/EvaluationEntity';
import { DeliverEvaluationDto } from '@/backend/application/evaluations/dtos/DeliverEvaluationDto';

export class EvaluationMapper {
  static toDeliverEvaluationDto(evaluation: EvaluationEntity): DeliverEvaluationDto {
    return new DeliverEvaluationDto(evaluation.evaluation_report_id, evaluation.score);
  }
}
