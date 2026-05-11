import { PrismaClient } from '@prisma/client';

export interface SaveUserAnswerRequest {
  reportId: number;
  order: number;
  rawText: string;
  cleanText: string;
}

// STT raw 텍스트와 후처리된 clean 텍스트를 함께 저장
export class SaveUserAnswerUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(request: SaveUserAnswerRequest): Promise<void> {
    const { reportId, order, rawText, cleanText } = request;

    const question = await this.prisma.question.findFirst({
      where: {
        reportId,
        order,
      },
    });

    if (!question) {
      throw new Error(`Question with reportId ${reportId} and order ${order} not found`);
    }

    await this.prisma.question.update({
      where: { id: question.id },
      data: {
        userAnswerRaw: rawText,
        userAnswerClean: cleanText,
      },
    });
  }
}
