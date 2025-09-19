'use client';

import { useEffect, useRef } from 'react';
import { useMediaStore } from '@/stores/useMediaStore';

interface UserCameraProps {
  message?: string;
  deviceId?: string; // 호환성 유지: 실제 스트림 제어는 전역 스토어에서 수행
}

export default function UserCamera({ message = '카메라 연결 실패' }: UserCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { camStream, camStatus } = useMediaStore();

  // 전역 카메라 스트림을 비디오 엘리먼트에 바인딩
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = camStream || null;
    if (camStream) {
      videoRef.current.play().catch(() => {});
    }
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [camStream]);

  const errorText =
    camStatus === 'blocked'
      ? '카메라 권한이 거부되었습니다'
      : camStatus === 'not-found'
        ? '사용 가능한 카메라를 찾을 수 없습니다'
        : camStatus === 'error'
          ? '카메라 연결 중 오류가 발생했습니다'
          : null;

  return (
    <div
      className={`w-full h-full relative border border-[#E2E8F0] overflow-hidden transition-all duration-300`}
    >
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
