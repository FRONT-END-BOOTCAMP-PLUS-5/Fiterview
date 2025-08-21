import { PrismaClient } from '@prisma/client';

export interface UpdateUserAnswerRequest {
  reportId: number;
  order: number;
  userAnswer: string;
}

export class UpdateUserAnswerUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(request: UpdateUserAnswerRequest): Promise<void> {
    const { reportId, order, userAnswer } = request;

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

    // 질문의 userAnswer 필드 업데이트
    await this.prisma.question.update({
      where: { id: question.id },
      data: {
        userAnswer,
      },
    });

    console.log(`✅ 사용자 답변이 업데이트되었습니다. Report ID: ${reportId}, Order: ${order}`);
  }
}
