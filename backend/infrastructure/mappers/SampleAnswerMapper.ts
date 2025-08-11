import { SampleAnswers } from '@/backend/domain/entities/SampleAnswers';

export class SampleAnswerMapper {
  static toSampleAnswers(reportId: number, sampleAnswers: string[]): SampleAnswers {
    return new SampleAnswers(reportId, sampleAnswers);
  }
}
