import { PrismaClient } from '@prisma/client';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';

export interface SaveUserAnswerRequest {
  reportId: number;
  order: number;
  transcription: STTResponse;
}

// STT 응답을 받아 DB에 저장
export class SaveUserAnswerUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(request: SaveUserAnswerRequest): Promise<void> {
    const { reportId, order, transcription } = request;

    // 해당 report와 order에 맞는 question이 존재하는지 확인
    const question = await this.prisma.question.findFirst({
      where: {
        reportId,
        order,
      },
    });

    if (!question) {
      throw new Error(`Question with reportId ${reportId} and order ${order} not found`);
    }

    // 질문의 userAnswer 필드에 변환된 텍스트 저장
    await this.prisma.question.update({
      where: { id: question.id },
      data: {
        userAnswer: transcription.text,
      },
    });
  }
}
