import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswersDto';
import { SampleAnswersEntity } from '@/backend/domain/entities/SampleAnswersEntity';

export interface ISampleAnswerEntity {
  generateResponse(dto: GenerateSampleAnswersDto): Promise<SampleAnswersEntity>;
}
