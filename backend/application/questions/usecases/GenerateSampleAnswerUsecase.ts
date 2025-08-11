import { SampleAnswers } from '@/backend/domain/entities/SampleAnswers';
import { ISampleAnswerRepository } from '@/backend/domain/repositories/ISampleAnswerRepository';
import { GenerateSampleAnswersDto } from '@/backend/application/questions/dtos/GenerateSampleAnswersDto';

export class GenerateSampleAnswerUsecase {
  constructor(private readonly sampleAnswerRepository: ISampleAnswerRepository) {}

  async execute(dto: GenerateSampleAnswersDto): Promise<SampleAnswers> {
    const sampleAnswers = await this.sampleAnswerRepository.generateResponse(dto);
    return sampleAnswers;
  }
}
