'use client';
import Mic from '@/public/assets/icons/mic.svg';
import { useRef, useEffect, useState } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';

type RecordingStatus = 'not_started' | 'recording' | 'completed' | 'error';

export default function UserAudio({
  active = false,
  onFinish,
  onError,
  text = '음성 인식 중...',
}: {
  active?: boolean; // true면 자동 시작, false면 자동 정지
  onFinish?: (blob: Blob) => void; // 정지 시 생성된 오디오 Blob 전달
  onError?: (e: Error) => void;
  text?: string;
}) {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MicRecorder | null>(null);
  const [status, setStatus] = useState<RecordingStatus>('not_started');
  const [started, setStarted] = useState(false);

  const startRecording = async () => {
    try {
      recorderRef.current = new MicRecorder({ bitRate: 128 }) as InstanceType<typeof MicRecorder>;
      await recorderRef.current.start();
      setStatus('recording');
      setStarted(true);
    } catch (e) {
      setStatus('error');
      onError?.(e as Error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recorderRef.current && status === 'recording') {
        const [buffer, blob] = await recorderRef.current?.stop().getMp3();
        setStatus('completed');
        onFinish?.(blob);
      }
    } catch (e) {
      setStatus('error');
      onError?.(e as Error);
    } finally {
      recorderRef.current = null;
      setStarted(false);
    }
  };

  useEffect(() => {
    if (active && !started) {
      startRecording();
    } else if (!active && started) {
      stopRecording();
    }
    return () => {
      // 언마운트/비활성화 시 안전 정지
      if (recorderRef.current && status === 'recording') {
        recorderRef.current
          .stop()
          .getMp3()
          .then(([, blob]) => onFinish?.(blob))
          .catch(() => {})
          .finally(() => {
            recorderRef.current = null;
            setStarted(false);
          });
      }
    };
  }, [active, started, status]);

  return (
    <div
      className={`w-full bg-white rounded-[8px] border border-[#E2E8F0] p-4 flex gap-[8px] items-center`}
    >
      <Mic width={16} height={16} />
      <div className="flex items-center text-[#1E293B] text-[12px] font-medium">
        {text}
        {status === 'recording' ? '' : '(대기)'}
      </div>
    </div>
  );
}
