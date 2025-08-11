import { BestAnswersEntity } from '@/backend/domain/entities/BestAnswersEntity';
import { IBestAnswerEntity } from '@/backend/domain/repositories/IBestAnswerEntity';
import { GenerateBestAnswersDto } from '@/backend/application/questions/dtos/GenerateBestAnswersDto';

export class GenerateBestAnswerUsecase {
  constructor(private readonly bestAnswerRepository: IBestAnswerEntity) {}

  async execute(dto: GenerateBestAnswersDto): Promise<BestAnswersEntity> {
    const bestAnswers = await this.bestAnswerRepository.generateResponse(dto);
    return bestAnswers;
  }
}
