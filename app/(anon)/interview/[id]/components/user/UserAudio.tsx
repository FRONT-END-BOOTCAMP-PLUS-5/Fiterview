'use client';

import Mic from '@/public/assets/icons/mic.svg';
import { useRef, useEffect, useState } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import type { RecordingStatus } from '@/types/interview';
import MicVisualizer from '@/app/(anon)/interview/[id]/components/user/MicVisualizer';

interface UserAudioProps {
  active?: boolean; // true면 자동 시작, false면 자동 정지
  onFinish?: (blob: Blob) => void; // 정지 시 생성된 오디오 Blob 전달
  onError?: (e: Error) => void;
  text?: string;
}

export default function UserAudio({
  active = false,
  onFinish,
  onError,
  text = '음성 인식 중...',
}: UserAudioProps) {
  const recorderRef = useRef<MicRecorder | null>(null);
  // onFinish의 중복 호출을 방지하기 위한 플래그
  const hasOnFinishFiredRef = useRef(false);
  // stop 로직의 동시/중복 진입을 막기 위한 플래그
  const isStoppingRef = useRef(false);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('not_started');
  const [hasStarted, setHasStarted] = useState(false);

  // 녹음 시작
  const startRecording = async () => {
    try {
      recorderRef.current = new MicRecorder({ bitRate: 128 }) as InstanceType<typeof MicRecorder>;
      await recorderRef.current.start();
      setRecordingStatus('recording');
      setHasStarted(true);
      hasOnFinishFiredRef.current = false;
      isStoppingRef.current = false;
    } catch (e) {
      setRecordingStatus('error');
      onError?.(e as Error);
    }
  };

  // 녹음 정지
  const stopRecording = async () => {
    try {
      if (isStoppingRef.current) return; // 재진입 방지
      isStoppingRef.current = true;
      if (recorderRef.current && recordingStatus === 'recording') {
        const [buffer, blob] = await recorderRef.current.stop().getMp3();
        setRecordingStatus('completed');
        if (!hasOnFinishFiredRef.current) {
          hasOnFinishFiredRef.current = true;
          onFinish?.(blob); // 녹음 완료 시 blob 전달
        }
      }
    } catch (e) {
      setRecordingStatus('error');
      onError?.(e as Error);
    } finally {
      recorderRef.current = null;
      setHasStarted(false);
      isStoppingRef.current = false;
    }
  };

  useEffect(() => {
    // active가 true이고 아직 녹음 시작 안했을 경우 녹음 시작
    if (active && !hasStarted) {
      startRecording();
    }
    // active가 false이고 녹음중인 경우 녹음 정지
    else if (!active && hasStarted) {
      stopRecording();
    }
  }, [active]);

  return (
    <div
      className={`absolute h-[64px] bottom-[52px] w-[calc(100%-104px)] rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] p-4 flex gap-[8px] items-center cursor-default `}
    >
      <Mic width={16} height={16} />
      <div className="flex items-center text-[#1E293B] text-[14px] font-medium">
        {text}
        {recordingStatus === 'recording' ? '' : '(대기)'}
      </div>
      <div className="flex ml-auto">
        <MicVisualizer
          active={recordingStatus === 'recording'}
          barsCount={15}
          heightPx={30}
          colors={['#2563EB', '#3B82F6', '#1D4ED8']}
        />
      </div>
    </div>
  );
}
