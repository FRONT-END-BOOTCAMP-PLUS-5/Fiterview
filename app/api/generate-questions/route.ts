import { NextRequest, NextResponse } from 'next/server';
import { GenerateQuestionRepository } from '@/backend/infrastructure/repositories/PrGenerateQuestionRepositoryImpl';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '파일이 필요합니다. 최소 1개 이상의 파일을 업로드해주세요.',
        },
        { status: 400 }
      );
    }

    // 파일 크기 및 타입 검증
    const maxFileSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];

    for (const file of files) {
      if (file.size > maxFileSize) {
        return NextResponse.json(
          {
            success: false,
            message: `파일 크기가 너무 큽니다: ${file.name} (최대 100MB)`,
          },
          { status: 400 }
        );
      }

      const fileExt = file.name.toLowerCase().split('.').pop();
      if (!fileExt || !allowedTypes.includes(`.${fileExt}`)) {
        return NextResponse.json(
          {
            success: false,
            message: `지원하지 않는 파일 형식: ${file.name} (지원 형식: PDF, PNG, JPG, JPEG, WEBP)`,
          },
          { status: 400 }
        );
      }
    }

    // 파일을 Buffer로 변환
    const fileBuffers = await Promise.all(
      files.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        fileName: file.name,
      }))
    );

    // 질문 생성
    const generateQuestionRepo = new GenerateQuestionRepository();
    const result = await generateQuestionRepo.generateQuestionsFromFiles(fileBuffers);

    return NextResponse.json({
      success: true,
      data: {
        questions: result.questions,
        generatedAt: new Date().toISOString(),
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
      message: 'Generate Questions API is ready',
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
