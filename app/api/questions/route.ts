import { NextRequest, NextResponse } from 'next/server';
import { GenerateQuestionsUseCase } from '@/backend/questions/application/usecases/GenerateQuestionsUseCase';
import { PrismaQuestionRepository } from '@/backend/questions/infrastructure/repositories/PrismaQuestionRepository';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const reportId = formData.get('reportId') as string;

    // reportId 필수 체크
    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          message: 'reportId가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 파일을 Buffer로 변환
    const questionFiles = await Promise.all(
      files.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        fileName: file.name,
      }))
    );

    // Use Case 실행 - 무조건 DB 저장
    const questionRepository = new PrismaQuestionRepository();
    const generateQuestionsUseCase = new GenerateQuestionsUseCase(questionRepository);
    const result = await generateQuestionsUseCase.execute(questionFiles, parseInt(reportId));

    return NextResponse.json({
      success: true,
      data: {
        questions: result.questions,
        reportId: result.reportId,
      },
    });
  } catch (error) {
    console.error('질문 생성 API 오류:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// GET 요청으로 API 상태 확인
export async function GET() {
  try {
    // API 키 존재 여부 확인
    const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;

    return NextResponse.json({
      success: true,
      message: 'Questions API is ready',
      status: {
        apiKeyConfigured: hasApiKey,
        supportedFormats: ['PDF', 'PNG', 'JPG', 'JPEG', 'WEBP'],
        maxFileSize: '100MB',
        maxFiles: 'unlimited',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'API 상태 확인 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
