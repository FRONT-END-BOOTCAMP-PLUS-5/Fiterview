import { NextRequest, NextResponse } from 'next/server';
import { GenerateQuestionRepository } from '@/backend/infrastructure/repositories/PrGenerateQuestionRepositoryImpl';

export async function POST(request: NextRequest) {
  try {
    // FormData 파싱
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 });
    }

    // 파일 크기 체크 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (const file of files) {
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `파일 ${file.name}의 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.` },
          { status: 400 }
        );
      }
    }

    // 파일 타입 체크 (이미지와 PDF 허용)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `파일 ${file.name}은 지원하지 않는 형식입니다. JPG, PNG, WEBP, PDF 파일만 업로드 가능합니다.`,
          },
          { status: 400 }
        );
      }
    }

    // 파일 확장자 체크
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    for (const file of files) {
      const fileName = file.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

      if (!hasValidExtension) {
        return NextResponse.json(
          {
            error: `파일 ${file.name}은 지원하지 않는 확장자입니다. JPG, PNG, WEBP, PDF 파일만 업로드 가능합니다.`,
          },
          { status: 400 }
        );
      }
    }

    // 리포지토리 사용
    const repo = new GenerateQuestionRepository();

    // 파일들을 Buffer로 변환
    const fileBuffers = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return {
          buffer,
          fileName: file.name,
        };
      })
    );

    // 질문 생성
    const result = await repo.generateQuestionsFromFiles(fileBuffers);

    return NextResponse.json({
      success: true,
      ...result,
      uploadedFiles: files.map((f) => ({ name: f.name, size: f.size })),
    });
  } catch (error) {
    console.error('질문 생성 중 오류:', error);

    return NextResponse.json(
      {
        error: '질문 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
