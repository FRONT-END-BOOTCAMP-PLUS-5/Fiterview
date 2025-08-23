'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopSection from '@/app/(anon)/interview/[id]/components/top/TopSection';
import BottomSection from '@/app/(anon)/interview/[id]/components/bottom/BottomSection';
import AiAvatar from '@/app/(anon)/interview/[id]/components/avatar/AiAvatar';
import Question from '@/app/(anon)/interview/[id]/components/avatar/Question';
import UserCamera from '@/app/(anon)/interview/[id]/components/user/UserCamera';
import UserAudio from '@/app/(anon)/interview/[id]/components/user/UserAudio';
import { useTtsAutoPlay } from '@/hooks/useTtsAutoPlay';
import { useGetTtsQuestions } from '@/hooks/useGetTtsQuestions';
import { transcribeAudio } from '@/hooks/useTranscribeAudio';
import { QuestionTTSResponse } from '@/backend/application/questions/dtos/QuestionTTSResponse';
import type { InterviewPhase } from '@/types/interview';
import axios from 'axios';
import { useModalStore } from '@/stores/useModalStore';
import { useReportStatusStore } from '@/stores/useReportStatusStore';

export default function InterviewClient() {
  const { openModal } = useModalStore();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const reportId = Number(id);
  const { updateReportStatus } = useReportStatusStore();

  const [phase, setPhase] = useState<InterviewPhase>('idle');
  const [currentOrder, setCurrentOrder] = useState(1);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const lastAdvancedOrderRef = useRef(0);

  const running = phase === 'recording';

  // 질문 TTS 조회 (훅 사용)
  const { data, isError, error } = useGetTtsQuestions(reportId);
  const items = (data as any)?.data as QuestionTTSResponse[] | undefined;
  const current = items?.[currentOrder - 1];
  const currentQuestionText = current?.question ?? '질문을 불러오는 중입니다...';
  const currentAudioSrc = current ? `data:audio/mpeg;base64,${current.audioBuffer}` : undefined;

  // 새로고침 복원: 저장된 order 불러오기
  useEffect(() => {
    if (!reportId) return;
    const key = `interview:${reportId}:currentOrder`;
    const saved = Number(localStorage.getItem(key));
    if (Number.isFinite(saved) && saved >= 1 && saved <= 10) {
      setCurrentOrder(saved);
    }
  }, [reportId]);

  // 진행 중 order 저장
  useEffect(() => {
    if (!reportId) return;
    const key = `interview:${reportId}:currentOrder`;
    localStorage.setItem(key, String(currentOrder));
  }, [reportId, currentOrder]);

  // 시작 버튼 클릭 후에만 TTS 허용
  const [ttsEnabled, setTtsEnabled] = useState(false);
  useEffect(() => {
    let startTimer: number | null = null;
    const onStart = () => {
      if (startTimer !== null) return;
      startTimer = window.setTimeout(() => {
        setTtsEnabled(true);
      }, 3000); //3초 대기 후 시작
    };
    window.addEventListener('fiterview:start', onStart as EventListener);
    return () => {
      window.removeEventListener('fiterview:start', onStart as EventListener);
      if (startTimer !== null) {
        clearTimeout(startTimer);
        startTimer = null;
      }
    };
  }, []);

  // TTS 자동 재생 훅
  const { audioRef, isPlaying } = useTtsAutoPlay(
    currentAudioSrc,
    () => {
      setIsNextBtnDisabled(false);
      setPhase('recording');
    },
    ttsEnabled
  );

  // tts재생(audioRef) + 립싱크 분석(AiAvatar)
  const [ttsAudioEl, setTtsAudioEl] = useState<HTMLAudioElement | null>(null);
  const setAudioElementRef = useCallback(
    (node: HTMLAudioElement | null) => {
      audioRef.current = node;
      setTtsAudioEl(node);
    },
    [audioRef]
  );

  const goNext = () => {
    // 마지막 질문이어도 즉시 이동하지 않고 녹음을 먼저 멈춰 업로드 → 이동
    stopAndAdvance();
  };

  // 녹음 중지
  const stopAndAdvance = () => {
    setIsNextBtnDisabled(true);
    if (running) {
      // 녹음만 멈춤 → onFinish에서 업로드 후 다음으로
      setPhase('idle');
    }
  };

  // 녹음본 업로드 함수
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

  // UserAudio에서 녹음이 끝나면 업로드 → 다음 질문으로 이동
  const handleFinishRecording = async (blob: Blob) => {
    setIsNextBtnDisabled(true);
    setIsUploading(true);
    try {
      if (lastAdvancedOrderRef.current === currentOrder) return; // 이미 처리된 거 중복 방지
      lastAdvancedOrderRef.current = currentOrder;
      if (!reportId) return;
      // 녹음 파일 업로드
      await uploadRecording({ reportId, order: currentOrder, blob });

      // STT 처리 (음성을 텍스트로 변환)
      try {
        const sttResult = await transcribeAudio({
          reportId,
          order: currentOrder,
        });

        if (sttResult.success) {
          console.log('STT 성공:', sttResult.data?.transcription.text);
        } else {
          console.error('STT 실패:', sttResult.error);
        }
      } catch (sttError) {
        console.error('STT 처리 중 오류:', sttError);
      }

      // 마지막 질문인 경우
      if (currentOrder >= 10) {
        const key = `interview:${reportId}:currentOrder`;
        localStorage.removeItem(key);

        // 피드백 생성
        const feedbackResult = await axios.post(`/api/reports/${reportId}/feedback`);
        console.log('피드백 생성 결과:', feedbackResult.status);

        openModal('reflection');
      } else {
        setCurrentOrder((o) => Math.min(10, o + 1));
      }
    } catch (e) {
      setIsNextBtnDisabled(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <TopSection running={running} duration={60} onComplete={goNext} />
      <main className="flex-1 flex">
        {/* Left: 아바타 면접관 영역 */}
        <section className="relative flex-1 min-w-0 h-full bg-[#F1F5F9] flex flex-col items-center justify-between">
          <audio ref={setAudioElementRef} className="hidden" playsInline />
          <AiAvatar ttsAudio={ttsAudioEl} playing={isPlaying} />
          <Question text={currentQuestionText} />
        </section>
        {/* Right: 사용자 영역 */}
        <section className="relative flex-1 min-w-0 h-full bg-[#FAFBFC] flex flex-col items-center justify-between gap-[24px]">
          <UserCamera />
          <UserAudio active={running} onFinish={handleFinishRecording} />
        </section>
      </main>
      <BottomSection
        currentQuestion={currentOrder}
        totalQuestions={10}
        onNext={goNext}
        isDisabled={isNextBtnDisabled || isUploading}
        nextLabel={currentOrder >= 10 ? '종료하기' : '다음 질문'}
      />
    </div>
  );
}
