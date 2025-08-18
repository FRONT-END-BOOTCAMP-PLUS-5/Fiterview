'use client';

import { useEffect, useRef, useState } from 'react';
import Frame from '@/public/assets/icons/frame.svg';

export default function UserCamera({
  message = '카메라 연결 실패',
  deviceId,
}: {
  message?: string;
  deviceId?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function start() {
      try {
        setErrorText(null);
        // 기존 스트림 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: unknown) {
        const name = (err as Error)?.name || '';
        if (name === 'NotAllowedError' || name === 'SecurityError')
          setErrorText('카메라 권한이 거부되었습니다');
        else if (name === 'NotFoundError' || name === 'OverconstrainedError')
          setErrorText('사용 가능한 카메라를 찾을 수 없습니다');
        else setErrorText('카메라 연결 중 오류가 발생했습니다');
      }
    }

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.mediaDevices !== 'undefined' &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    ) {
      start();
    } else {
      setErrorText('이 브라우저에서는 카메라를 사용할 수 없습니다');
    }

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [deviceId]);

  //   const heightPx = expanded ? 500 : 300;
  //   const widthPx = expanded ? 500 : 300;

  return (
    <div
      className={`w-full h-full relative border border-[#E2E8F0] rounded-[4px] overflow-hidden transition-all duration-300`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="absolute right-[8px] top-[8px] z-10 p-1 rounded-[6px] bg-white hover:bg-white transition-colors border border-[#CBD5E1]"
        aria-label={expanded ? '축소' : '확대'}
      >
        <Frame className="w-6 h-6 text-[#CBD5E1]" />
      </button>

      {errorText ? (
        <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-[14px]">
          {errorText || message}
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover transform -scale-x-100"
          playsInline
          muted
        />
      )}
    </div>
  );
}
