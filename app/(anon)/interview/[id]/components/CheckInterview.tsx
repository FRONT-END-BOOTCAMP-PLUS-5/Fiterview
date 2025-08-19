'use client';

import { useCallback, useState } from 'react';

export default function CheckInterview() {
  const [started, setStarted] = useState(false);

  const handleStart = useCallback(() => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        setTimeout(() => ctx.close().catch(() => {}), 0);
      }
    } catch (_) {}
    // TTS 활성화 신호 브로드캐스트
    window.dispatchEvent(new CustomEvent('fiterview:start'));
    setStarted(true);
  }, []);

  if (started) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#F1F5F9]">
      <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center gap-4">
        <h1 className="text-xl font-semibold">면접을 시작할까요?</h1>
        <p className="text-sm text-gray-500">
          시작을 누르면 음성 재생과 카메라/마이크가 활성화됩니다.
        </p>
        <button
          type="button"
          onClick={handleStart}
          className="px-5 py-2.5 rounded-md bg-black text-white hover:bg-gray-800"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
