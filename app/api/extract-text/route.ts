import { NextRequest, NextResponse } from 'next/server';
import { ExtractTextFromFile } from '@/backend/application/questions/usecases/ExtractTextFromFile';
import { FileToTextAdapter } from '@/backend/infrastructure/repositories/FileToTextRepository';

export async function POST(request: NextRequest) {
  try {
    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 });
    }

    // 파일 크기 체크 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.' },
        { status: 400 }
      );
    }

    // 파일 타입 체크 (이미지와 PDF 허용)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. JPG, PNG, PDF 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 확장자 체크
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 확장자입니다. JPG, PNG, PDF 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 유스케이스 실행
    const textExtractor = new FileToTextAdapter();
    const extractTextUseCase = new ExtractTextFromFile(textExtractor);

    const extractedText = await extractTextUseCase.execute({
      file: buffer,
      fileName: file.name,
    });

    return NextResponse.json({
      success: true,
      extractedText,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('텍스트 추출 중 오류:', error);

    return NextResponse.json(
      {
        error: '텍스트 추출 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
