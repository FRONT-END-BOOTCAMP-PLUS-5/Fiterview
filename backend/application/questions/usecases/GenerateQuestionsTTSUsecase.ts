import { TTSRequest } from '@/backend/domain/dtos/TTSRequest';
import { TTSResponse } from '@/backend/domain/dtos/TTSResponse';
import { TtsAI } from '@/backend/domain/AI/TtsAI';
import { QuestionTTSResponse } from '@/backend/application/questions/dtos/QuestionTTSResponse';
import { QuestionRepository } from '@/backend/domain/repositories/QuestionRepository';

export class GenerateQuestionsTTSUsecase {
  constructor(
    private questionRepository: QuestionRepository,
    private ttsAI: TtsAI
  ) {}

  async execute(reportId: number): Promise<QuestionTTSResponse[]> {
    try {
      // 1. 질문 10개 조회
      const questions = await this.questionRepository.getQuestionsByReportId(reportId);

      if (questions.length === 0) {
        throw new Error('해당 리포트에 질문이 없습니다.');
      }

      // 2. 각 질문을 TTS로 변환 (병렬 처리)
      const ttsPromises = questions.map(async (question) => {
        const ttsRequest: TTSRequest = {
          text: question.question,
          voice: 'ko-KR-Neural2-A',
        };

        const ttsResponse: TTSResponse = await this.ttsAI.synthesizeSpeech(ttsRequest);

        return {
          questionId: question.id,
          question: question.question,
          order: question.order,
          audioBuffer: ttsResponse.audio.toString('base64'),
        };
      });

      // 3. 모든 TTS 변환 완료 후 반환
      const questionsWithTTS = await Promise.all(ttsPromises);

      // order 기준으로 정렬 (null인 경우 id로 정렬)
      return questionsWithTTS.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return a.questionId - b.questionId;
      });
    } catch (error) {
      console.error('질문 TTS 생성 중 오류 발생:', error);
      throw new Error(
        `질문 TTS 생성에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
