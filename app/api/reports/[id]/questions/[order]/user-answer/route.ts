import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UpdateUserAnswerUseCase } from '@/backend/application/questions/usecases/UpdateUserAnswerUseCase';
import { getUserFromSession } from '@/lib/auth/api-auth';

const prisma = new PrismaClient();
const updateUserAnswerUseCase = new UpdateUserAnswerUseCase(prisma);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; order: string }> }
) {
  try {
    // 사용자 인증 확인
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 });
    }

    const userId = Number(user.id);
    const { id, order } = await params;
    const reportId = parseInt(id, 10);
    const questionOrder = parseInt(order, 10);

    if (isNaN(reportId) || isNaN(questionOrder)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 리포트 ID 또는 질문 순서입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userAnswer } = body as { userAnswer: string };

    if (!userAnswer || typeof userAnswer !== 'string') {
      return NextResponse.json(
        { success: false, message: '사용자 답변이 필요합니다.' },
        { status: 400 }
      );
    }

    // 리포트 소유권 확인
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { userId: true },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, message: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (report.userId !== userId) {
      return NextResponse.json(
        { success: false, message: '이 리포트에 대한 권한이 없습니다.' },
        { status: 403 }
      );
    }

    await updateUserAnswerUseCase.execute({
      reportId,
      order: questionOrder,
      userAnswer,
    });

    return NextResponse.json({
      success: true,
      message: '사용자 답변이 성공적으로 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('사용자 답변 업데이트 오류:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, message: '질문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
