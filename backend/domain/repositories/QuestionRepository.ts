import { QuestionFile, QuestionGenerationResult } from '../../application/questions/dtos/Question';

export interface QuestionRepository {
  generateQuestions(files: QuestionFile[]): Promise<QuestionGenerationResult>;
}
