'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import TopSection from './components/TopSection';
import BottomSection from './components/BottomSection';
import AiAvatar from './components/AiAvatar';
import Question from './components/Question';
import UserCamera from './components/UserCamera';
import UserAudio from './components/UserAudio';
import { useCreateRecording } from '@/hooks/useCreateRecording';
import { useGetTtsQuestions } from '@/hooks/useGetTtsQuestions';
import { QuestionTTSResponse } from '@/backend/application/questions/dtos/QuestionTTSResponse';
import { useTtsAutoPlay } from '@/hooks/useTtsAutoPlay';

export default function InterviewClient() {
  const { id } = useParams<{ id: string }>();
  const reportId = Number(id);

  // FSM + 진행 상태 (타이머는 Timer 컴포넌트가 관리)
  // idle: 대기 상태, tts: tts 재생 중, recording: 녹음 중
  const [phase, setPhase] = useState<'idle' | 'tts' | 'recording'>('idle');
  const running = phase === 'recording';

  const [currentOrder, setCurrentOrder] = useState(1);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);

  // 클라이언트에서 질문 TTS 조회
  const { data /*, isLoading, isError */ } = useGetTtsQuestions(reportId);
  const items = (data as any)?.data as QuestionTTSResponse[] | undefined;

  const current = items?.[currentOrder - 1];
  const currentQuestionText = current?.question ?? '질문을 불러오는 중입니다...';
  const currentAudioSrc = current ? `data:audio/mpeg;base64,${current.audioBuffer}` : undefined;

  // TTS 자동 재생 훅
  const { audioRef } = useTtsAutoPlay(currentAudioSrc, () => {
    setIsNextBtnDisabled(false);
    setPhase('recording');
  });

  const lastAdvancedOrderRef = useRef(0);

  // 업로드 훅
  const createRecording = useCreateRecording();

  const stopAndAdvance = () => {
    setIsNextBtnDisabled(true);
    if (running) {
      // 녹음만 멈춤 → onFinish에서 업로드 후 다음으로
      setPhase('idle');
    } else {
      // 녹음 중이 아니면 바로 다음으로 (중복 방지)
      if (lastAdvancedOrderRef.current !== currentOrder) {
        lastAdvancedOrderRef.current = currentOrder;
        setCurrentOrder((o) => Math.min(10, o + 1));
      }
    }
  };

  // UserAudio에서 녹음이 끝나면 업로드 → 다음 질문으로 이동 (단일 경로)
  const handleFinishRecording = async (blob: Blob) => {
    setIsNextBtnDisabled(true);
    try {
      if (lastAdvancedOrderRef.current === currentOrder) return; // 이미 처리됨 중복 방지
      lastAdvancedOrderRef.current = currentOrder;
      if (Number.isFinite(reportId) && reportId > 0) {
        await createRecording.mutateAsync({ reportId, order: currentOrder, blob });
      }
    } finally {
      setCurrentOrder((o) => Math.min(10, o + 1));
    }
  };

  const goNext = () => {
    stopAndAdvance();
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <TopSection
        running={running}
        duration={60}
        onComplete={() => {
          // 타임아웃도 동일한 경로로 처리
          stopAndAdvance();
        }}
      />
      <main className="flex-1 flex overflow-hidden">
        {/* Left: 아바타 면접관 영역 */}
        <section className="flex-1 min-w-0 h-full bg-[#F1F5F9] flex flex-col items-center justify-between p-[52px]">
          <AiAvatar />
          <audio ref={audioRef} className="hidden" />
          <Question text={currentQuestionText} />
        </section>
        {/* Right: 사용자 영역 */}
        <section className="flex-1 min-w-0 h-full bg-[#FAFBFC] flex flex-col items-center justify-between p-[52px] gap-[24px]">
          <UserCamera />
          <UserAudio active={running} onFinish={handleFinishRecording} />
        </section>
      </main>
      <BottomSection
        currentQuestion={currentOrder}
        totalQuestions={10}
        onNext={goNext}
        isDisabled={isNextBtnDisabled || createRecording.isPending}
      />
    </div>
  );
}
