import { GenerateBestAnswersDto } from '@/backend/application/questions/dtos/GenerateBestAnswersDto';
import { BestAnswersEntity } from '@/backend/domain/entities/BestAnswersEntity';

export interface IBestAnswerEntity {
  generateResponse(dto: GenerateBestAnswersDto): Promise<BestAnswersEntity>;
}
