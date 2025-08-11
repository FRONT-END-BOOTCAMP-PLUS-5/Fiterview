import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { STTRepositoryImpl } from '@/backend/infrastructure/repositories/STTRepositoryImpl';
import { STTRequest } from '@/backend/domain/dtos/STTRequest';

//테스트 라우트 파일
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Clean Architecture STT 테스트 시작...\n');

    // STT Repository 구현체 생성 (의존성 주입)
    const sttRepository = new STTRepositoryImpl();
    console.log('✅ STT Repository 초기화 완료');

    // 프로젝트 폴더의 오디오 파일 경로
    const audioFilePath = path.join(process.cwd(), 'public', 'assets', 'audios', 'test.m4a');

    // 파일 존재 여부 확인
    if (!fs.existsSync(audioFilePath)) {
      return NextResponse.json(
        {
          error: 'test.m4a 파일을 찾을 수 없습니다.',
          expectedPath: audioFilePath,
          message: '파일이 정확히 public/assets/audios 폴더에 있는지 확인해주세요.',
        },
        { status: 404 }
      );
    }

    console.log('📁 오디오 파일 발견:', audioFilePath);

    // 오디오 파일 읽기
    const audioBuffer = fs.readFileSync(audioFilePath);
    console.log('📖 오디오 파일 읽기 완료, 크기:', audioBuffer.length, 'bytes');

    // STT 실행
    console.log('🔄 음성-텍스트 변환 시작...');
    const result = await sttRepository.transcribeToText({
      audioFile: audioBuffer,
      fileName: 'test.m4a',
      language: 'ko',
    } as STTRequest);

    console.log('✅ 변환 완료!');

    const response = {
      message: 'Clean Architecture STT 테스트 완료',
      timestamp: new Date().toISOString(),
      architecture: 'Clean Architecture',
      audioFile: {
        path: audioFilePath,
        size: audioBuffer.length,
        name: 'test.m4a',
      },
      transcription: {
        text: result.text,
        language: result.language,
        model: 'gpt-4o-transcribe',
      },
    };

    console.log('📝 결과:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Clean Architecture STT 테스트 실패:', error);
    return NextResponse.json(
      {
        error: 'Clean Architecture STT 테스트 실패',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
