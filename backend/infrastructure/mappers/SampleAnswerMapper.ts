import { SampleAnswersEntity } from '@/backend/domain/entities/SampleAnswersEntity';

export class SampleAnswerMapper {
  static toSampleAnswerEntity(reportId: number, sampleAnswers: string[]): SampleAnswersEntity {
    return new SampleAnswersEntity(reportId, sampleAnswers);
  }
}
