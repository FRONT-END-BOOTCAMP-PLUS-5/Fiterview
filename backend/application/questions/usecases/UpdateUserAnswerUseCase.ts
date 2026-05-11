import { PrismaClient } from '@prisma/client';

export interface UpdateUserAnswerRequest {
  reportId: number;
  order: number;
  userAnswerClean: string;
}

// 사용자가 직접 편집한 답변은 clean 필드에만 반영한다.
// raw는 STT 원본 보존용이므로 사용자 편집으로 덮어쓰지 않는다.
export class UpdateUserAnswerUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(request: UpdateUserAnswerRequest): Promise<void> {
    const { reportId, order, userAnswerClean } = request;

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
        userAnswerClean,
      },
    });
  }
}
