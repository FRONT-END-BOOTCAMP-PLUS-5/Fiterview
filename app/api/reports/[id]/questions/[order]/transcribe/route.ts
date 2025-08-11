import { NextRequest, NextResponse } from 'next/server';
import { STTRepositoryImpl } from '@/backend/infrastructure/repositories/STTRepositoryImpl';
import { STTRequest } from '@/backend/domain/dtos/STTRequest';
import { STTResponse } from '@/backend/domain/dtos/STTResponse';
import { TranscribeQuestionResponse } from '@/backend/application/questions/dtos/TranscribeQuestionResponse';
import { SaveUserAnswerUseCase } from '@/backend/application/questions/usecases/SaveUserAnswerUseCase';
import { PrismaClient } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; order: string } }
) {
  try {
    const { id, order } = params;
    const reportIdNumber = parseInt(id);
    const orderNumber = parseInt(order);

    if (isNaN(reportIdNumber) || reportIdNumber < 1) {
      return NextResponse.json(
        {
          error: '유효하지 않은 리포트 ID입니다.',
          id: id,
        },
        { status: 400 }
      );
    }

    if (isNaN(orderNumber) || orderNumber < 1 || orderNumber > 10) {
      return NextResponse.json(
        {
          error: '유효하지 않은 질문 순서입니다.',
          order: order,
          validRange: '1-10',
        },
        { status: 400 }
      );
    }

    console.log(`🚀 리포트 ${reportIdNumber}의 질문 ${orderNumber}번 음성-텍스트 변환 시작...\n`);

    // Prisma 클라이언트 초기화
    const prisma = new PrismaClient();

    // STT Repository 구현체 생성 (의존성 주입)
    const sttRepository = new STTRepositoryImpl();
    console.log('✅ STT Repository 초기화 완료');

    console.log('✅ saveUserAnswer 함수 준비 완료');

    // 요청 본문에서 데이터 추출 및 DTO 검증
    const body = await request.json();
    const { audio, language = 'ko' } = body;

    if (!audio) {
      return NextResponse.json(
        {
          error: '오디오 데이터가 누락되었습니다.',
          required: ['audio'],
        },
        { status: 400 }
      );
    }

    console.log(`📝 Report ID: ${reportIdNumber}, Order: ${orderNumber} 처리 시작`);

    // 오디오 데이터를 Buffer로 변환 (base64 또는 binary)
    let audioBuffer: Buffer;
    if (typeof audio === 'string') {
      // base64 문자열인 경우
      audioBuffer = Buffer.from(audio, 'base64');
    } else if (audio instanceof ArrayBuffer) {
      // ArrayBuffer인 경우
      audioBuffer = Buffer.from(audio);
    } else {
      return NextResponse.json(
        {
          error: '지원하지 않는 오디오 형식입니다.',
          supportedFormats: ['base64 string', 'ArrayBuffer'],
        },
        { status: 400 }
      );
    }

    console.log('📖 오디오 데이터 읽기 완료, 크기:', audioBuffer.length, 'bytes');

    // STT 실행
    console.log('🔄 음성-텍스트 변환 시작...');
    const sttResult: STTResponse = await sttRepository.transcribeToText({
      audioFile: audioBuffer,
      fileName: `question_${orderNumber}.m4a`,
      language,
    });

    console.log('✅ 변환 완료!');

    // UseCase를 통해 DB에 변환된 텍스트 저장
    const saveUserAnswerUseCase = new SaveUserAnswerUseCase(prisma);
    await saveUserAnswerUseCase.execute({
      reportId: reportIdNumber,
      order: orderNumber,
      transcription: sttResult,
    });
    console.log('💾 DB 저장 완료!');

    const response: TranscribeQuestionResponse = {
      message: '사용자 답변이 성공적으로 저장되었습니다.',
      timestamp: new Date().toISOString(),
      data: {
        reportId: reportIdNumber,
        order: orderNumber,
        transcription: {
          text: sttResult.text,
          language: sttResult.language,
          model: 'gpt-4o-transcribe',
        },
      },
    };

    console.log('📝 결과:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ 음성-텍스트 변환 실패:', error);
    return NextResponse.json(
      {
        error: '음성-텍스트 변환 실패',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
