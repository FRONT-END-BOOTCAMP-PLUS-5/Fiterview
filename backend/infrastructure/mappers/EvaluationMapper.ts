import { EvaluationEntity } from '@/backend/domain/entities/EvaluationEntity';

export class EvaluationMapper {
  static toEvaluationEntity(reportId: number, score: string): EvaluationEntity {
    return new EvaluationEntity(reportId, score);
  }
}
