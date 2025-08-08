import { GenerateSpeechUsecase } from '@/backend/application/questions/usecases/GenerateSpeechUsecase';
import { PrTTSRepository } from '@/backend/infrastructure/repositories/TTSRepositoryInfra';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '텍스트가 없습니다.' }, { status: 400 });
    }

    // UseCase와 Repository 인스턴스 생성
    // 의존성 주입
    const ttsRepository = new PrTTSRepository();
    const generateSpeechUsecase = new GenerateSpeechUsecase(ttsRepository);

    // UseCase 실행
    const result = await generateSpeechUsecase.execute({
      text,
      voice: voice || 'ko-KR-Neural2-A',
    });

    // Base64로 인코딩하여 전송
    const base64Audio = result.audio.toString('base64');

    return NextResponse.json({
      audio: base64Audio,
      format: 'mp3',
    });
  } catch (error) {
    return NextResponse.json({ error: 'TTS 생성에 실패했습니다.' }, { status: 500 });
  }
}
