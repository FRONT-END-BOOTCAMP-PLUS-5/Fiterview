'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import TopSection from './components/TopSection';
import BottomSection from './components/BottomSection';
import AiAvatar from './components/AiAvatar';
import Question from './components/Question';
import UserCamera from './components/UserCamera';
import UserAudio from './components/UserAudio';
import { useGetTtsQuestions } from '@/hooks/useGetTtsQuestions';
import { QuestionTTSResponse } from '@/backend/application/questions/dtos/QuestionTTSResponse';
import { useCreateRecording } from '@/hooks/useCreateRecording';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const reportId = Number(id);

  // FSM + 진행 상태 (타이머는 Timer 컴포넌트가 관리)
  const [phase, setPhase] = useState<'idle' | 'tts' | 'recording'>('idle');
  const [currentOrder, setCurrentOrder] = useState(1);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);

  const { data /*, isLoading, isError, error */ } = useGetTtsQuestions(reportId);
  const items = (data as any)?.data as QuestionTTSResponse[] | undefined;
  const total = items?.length ?? 0;
  const current = items?.find((q) => q.order === currentOrder);
  const currentQuestionText = current?.question ?? '질문을 불러오는 중입니다...';
  const currentAudioSrc = current ? `data:audio/mpeg;base64,${current.audioBuffer}` : undefined;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 업로드 훅
  const createRecording = useCreateRecording();

  // 현재 질문의 TTS 자동 재생 + 종료/에러 핸들링
  useEffect(() => {
    if (!currentAudioSrc) return;
    setPhase('tts');
    setIsNextBtnDisabled(true);

    const el = audioRef.current;
    if (!el) return;

    el.src = currentAudioSrc;
    const handleEnded = () => {
      setIsNextBtnDisabled(false); // 다음 버튼 활성화
      setPhase('recording'); // 타이머 시작 (Timer 컴포넌트에서 running=true로 감지)
    };
    const handleError = () => {
      setIsNextBtnDisabled(false);
      setPhase('recording');
    };

    el.addEventListener('ended', handleEnded);
    el.addEventListener('error', handleError);
    el.play().catch(() => handleError());

    return () => {
      el.pause();
      el.currentTime = 0;
      el.removeEventListener('ended', handleEnded);
      el.removeEventListener('error', handleError);
    };
  }, [currentAudioSrc, total]);

  const running = phase === 'recording';

  // UserAudio에서 녹음이 끝나면 업로드
  const handleFinishRecording = async (blob: Blob) => {
    if (!Number.isFinite(reportId) || reportId <= 0) return;
    setIsNextBtnDisabled(true);
    try {
      await createRecording.mutateAsync({ reportId, order: currentOrder, blob });
    } finally {
      setPhase('idle');
      setCurrentOrder((o) => Math.min(total || 1, o + 1));
    }
  };

  const goNext = () => {
    if (running) {
      // 녹음 중이면 UserAudio가 active=false를 감지하여 stop+onFinish 호출 → 업로드 처리로 연결됨
      setPhase('idle');
      setIsNextBtnDisabled(true);
    } else {
      // 녹음 중이 아니면 바로 다음으로 이동
      setIsNextBtnDisabled(true);
      setCurrentOrder((o) => Math.min(total || 1, o + 1));
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <TopSection
        running={running}
        duration={60}
        onComplete={() => {
          // 타임아웃 → 녹음 중이면 stop 트리거 후 업로드, 아니면 바로 다음
          if (running) {
            setPhase('idle');
            setIsNextBtnDisabled(true);
          } else {
            setIsNextBtnDisabled(true);
            setCurrentOrder((o) => Math.min(total || 1, o + 1));
          }
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
        currentQuestion={Math.min(currentOrder, Math.max(total, 1))}
        totalQuestions={Math.max(total, 1)}
        onNext={goNext}
        isDisabled={isNextBtnDisabled || createRecording.isPending}
      />
    </div>
  );
}
