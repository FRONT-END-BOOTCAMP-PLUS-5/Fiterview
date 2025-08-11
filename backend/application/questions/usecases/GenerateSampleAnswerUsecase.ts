import { SampleAnswersEntity } from '@/backend/domain/entities/SampleAnswersEntity';
import { ISampleAnswerEntity } from '@/backend/domain/repositories/ISampleAnswerEntity';
import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswersDto';

export class GenerateSampleAnswerUsecase {
  constructor(private readonly sampleAnswerRepository: ISampleAnswerEntity) {}

  async execute(dto: GenerateSampleAnswersDto): Promise<SampleAnswersEntity> {
    const sampleAnswers = await this.sampleAnswerRepository.generateResponse(dto);
    return sampleAnswers;
  }
}
