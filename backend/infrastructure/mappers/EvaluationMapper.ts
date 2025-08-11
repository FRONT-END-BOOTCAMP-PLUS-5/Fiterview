import { Evaluation } from '@/backend/domain/entities/Evaluation';

export class EvaluationMapper {
  static toEvaluation(reportId: number, score: string): Evaluation {
    return new Evaluation(reportId, score);
  }
}
