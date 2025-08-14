import { QuestionRepository } from '@/backend/domain/repositories/QuestionRepository';
import { AudioFileInfo } from '@/backend/domain/entities/Question';

export class GetAudioByQuestionUseCase {
  constructor(private readonly questionRepository: QuestionRepository) {}

  /**
   * 질문에 해당하는 음성 파일을 조회
   */
  async execute(reportId: number, questionOrder: number): Promise<AudioFileInfo> {
    try {
      return await this.questionRepository.getAudioFileByQuestion(reportId, questionOrder);
    } catch (error) {
      console.error('음성 파일 조회 실패:', error);
      throw error;
    }
  }
}
