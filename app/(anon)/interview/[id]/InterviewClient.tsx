'use client';

import { useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import TopSection from './components/TopSection';
import BottomSection from './components/BottomSection';
import AiAvatar from './components/AiAvatar';
import Question from './components/Question';
import UserCamera from './components/UserCamera';
import UserAudio from './components/UserAudio';
import { useTtsAutoPlay } from '@/hooks/useTtsAutoPlay';
import { useGetTtsQuestions } from '@/hooks/useGetTtsQuestions';
import { QuestionTTSResponse } from '@/backend/application/questions/dtos/QuestionTTSResponse';

export default function InterviewClient() {
  const { id } = useParams<{ id: string }>();
  const reportId = Number(id);

  // FSM + 진행 상태 (타이머는 Timer 컴포넌트가 관리)
  const [phase, setPhase] = useState<'idle' | 'tts' | 'recording'>('idle');
  const [currentOrder, setCurrentOrder] = useState(1);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const lastAdvancedOrderRef = useRef(0);

  const running = phase === 'recording';

  // 질문 TTS 조회 (훅 사용)
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

  const goNext = () => {
    stopAndAdvance();
  };

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

  // 업로드 함수
  const uploadRecording = async (params: { reportId: number; order: number; blob: Blob }) => {
    const { reportId, order, blob } = params;
    const extension = blob.type.includes('webm') ? 'webm' : 'mp3';
    const file = new File([blob], `recording_${reportId}_${order}.${extension}`, {
      type: blob.type || 'audio/mpeg',
    });
    const formData = new FormData();
    formData.append('audio', file);
    const url = `/api/reports/${reportId}/questions/${order}/recording`;
    const res = await fetch(url, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('녹음 업로드 실패');
    const json = await res.json();
    if (!json?.success) throw new Error(json?.error || '녹음 업로드 실패');
    return json as { success: boolean; fileName?: string };
  };

  // UserAudio에서 녹음이 끝나면 업로드 → 다음 질문으로 이동 (단일 경로)
  const handleFinishRecording = async (blob: Blob) => {
    setIsNextBtnDisabled(true);
    setIsUploading(true);
    try {
      if (lastAdvancedOrderRef.current === currentOrder) return; // 이미 처리됨 중복 방지
      lastAdvancedOrderRef.current = currentOrder;
      if (Number.isFinite(reportId) && reportId > 0) {
        await uploadRecording({ reportId, order: currentOrder, blob });
      }
    } finally {
      setIsUploading(false);
      setCurrentOrder((o) => Math.min(10, o + 1));
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <TopSection running={running} duration={60} onComplete={goNext} />
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
        isDisabled={isNextBtnDisabled || isUploading}
      />
    </div>
  );
}
