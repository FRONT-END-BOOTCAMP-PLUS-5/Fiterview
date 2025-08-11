import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswersDto';
import { SampleAnswers } from '@/backend/domain/entities/SampleAnswers';

export interface ISampleAnswerRepository {
  generateResponse(dto: GenerateSampleAnswersDto): Promise<SampleAnswers>;
}
