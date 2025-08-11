import { PrismaClient } from '@prisma/client';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';

export interface SaveUserAnswerRequest {
  reportId: number;
  order: number;
  transcription: STTResponse;
}

export const saveUserAnswer = async (
  prisma: PrismaClient,
  request: SaveUserAnswerRequest
): Promise<void> => {
  const { reportId, order, transcription } = request;

  // 해당 report와 order에 맞는 question이 존재하는지 확인
  const question = await prisma.question.findFirst({
    where: {
      reportId,
      order,
    },
  });

  if (!question) {
    throw new Error(`Question with reportId ${reportId} and order ${order} not found`);
  }

  // 질문의 userAnswer 필드에 변환된 텍스트 저장
  await prisma.question.update({
    where: { id: question.id },
    data: {
      userAnswer: transcription.text,
    },
  });

  // Report 상태를 'COMPLETED'로 업데이트
  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: 'COMPLETED',
    },
  });

  console.log(`✅ 사용자 답변이 저장되었습니다. Report ID: ${reportId}, Order: ${order}`);
};
