'use client';

import Mic from '@/public/assets/icons/mic.svg';
import { useRef, useEffect, useState } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';

// 녹음 진행 상태를 표현하는 뷰 모델 값
type RecordingStatus = 'not_started' | 'recording' | 'completed' | 'error';

// 컴포넌트 Props 정의
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
  // 외부 라이브러리 인스턴스 보관
  const recorderRef = useRef<MicRecorder | null>(null);

  // onFinish의 중복 호출을 방지하기 위한 플래그
  const hasOnFinishFiredRef = useRef(false);

  // stop 로직의 동시/중복 진입을 막기 위한 플래그
  const isStoppingRef = useRef(false);

  // 화면 표시 및 제어를 위한 상태
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('not_started');
  const [hasStarted, setHasStarted] = useState(false);

  // 녹음을 시작한다
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

  // 녹음을 정지하고, 결과를 한 번만 전달한다
  const stopRecording = async () => {
    try {
      if (isStoppingRef.current) return; // 재진입 방지
      isStoppingRef.current = true;
      if (recorderRef.current && recordingStatus === 'recording') {
        const [buffer, blob] = await recorderRef.current.stop().getMp3();
        setRecordingStatus('completed');
        if (!hasOnFinishFiredRef.current) {
          hasOnFinishFiredRef.current = true;
          onFinish?.(blob);
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

  // active 변화에 맞춰 start/stop를 정확히 1회씩만 수행
  useEffect(() => {
    if (active && !hasStarted) {
      startRecording();
    } else if (!active && hasStarted) {
      stopRecording();
    }
  }, [active]);

  return (
    <div
      className={`w-full bg-white rounded-[8px] border border-[#E2E8F0] p-4 flex gap-[8px] items-center`}
    >
      <Mic width={16} height={16} />
      <div className="flex items-center text-[#1E293B] text-[12px] font-medium">
        {text}
        {recordingStatus === 'recording' ? '' : '(대기)'}
      </div>
    </div>
  );
}
