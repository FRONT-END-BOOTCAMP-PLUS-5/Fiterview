import { NextRequest, NextResponse } from 'next/server';
import { TranscribeAudioUseCase } from '@/backend/application/questions/usecases/TranscribeAudioUseCase';
import { SaveUserAnswerUseCase } from '@/backend/application/questions/usecases/SaveUserAnswerUseCase';
import { STTRepositoryImpl } from '@/backend/infrastructure/repositories/STTRepositoryImpl';
import { AudioFileService } from '@/backend/infrastructure/services/AudioFileService';
import { FileProcessingService } from '@/backend/infrastructure/services/FileProcessingService';
import { TranscribeQuestionResponse } from '@/backend/application/questions/dtos/TranscribeQuestionResponse';
import { PrismaClient } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; order: string }> }
) {
  try {
    const { id, order } = await params;
    const reportIdNumber = parseInt(id);
    const orderNumber = parseInt(order);

    if (isNaN(reportIdNumber) || reportIdNumber < 1) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 리포트 ID입니다.' },
        { status: 400 }
      );
    }

    if (isNaN(orderNumber) || orderNumber < 1 || orderNumber > 10) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 질문 순서입니다.', validRange: '1-10' },
        { status: 400 }
      );
    }

    // 의존성 주입
    const prisma = new PrismaClient();
    const sttRepository = new STTRepositoryImpl();
    const transcribeAudioUseCase = new TranscribeAudioUseCase(sttRepository);
    const saveUserAnswerUseCase = new SaveUserAnswerUseCase(prisma);

    // DB에서 음성 파일 조회
    const audioFileInfo = await AudioFileService.getAudioFileFromDB(
      prisma,
      reportIdNumber,
      orderNumber
    );

    // 파일 크기 검증 (FileProcessingService 사용)
    const validationResult = FileProcessingService.validateFileSize(
      audioFileInfo.fileBuffer.length
    );
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
          currentSize: validationResult.fileSizeMB,
          maxSize: '25MB',
        },
        { status: 400 }
      );
    }

    // STT 처리
    const sttResult = await transcribeAudioUseCase.execute(
      audioFileInfo.fileBuffer,
      audioFileInfo.fileName,
      'ko' // 기본값으로 한국어 설정
    );

    // DB 저장
    await saveUserAnswerUseCase.execute({
      reportId: reportIdNumber,
      order: orderNumber,
      transcription: sttResult,
    });

    // 응답 생성
    const response = {
      message: '사용자 답변이 성공적으로 저장되었습니다.',
      timestamp: new Date().toISOString(),
      reportId: reportIdNumber,
      order: orderNumber,
      transcription: {
        text: sttResult.text,
        language: sttResult.language,
        model: 'gpt-4o-transcribe',
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('음성-텍스트 변환 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
