'use client';

import { useEffect, useRef } from 'react';

interface MicVisualizerProps {
  active: boolean;
  barsCount: number;
  heightPx?: number;
  baseScale?: number; // 0~1 사이, 기본 막대 높이(정지/저음 시)
}

export default function MicVisualizer({
  active,
  barsCount,
  heightPx,
  baseScale = 0.35,
}: MicVisualizerProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqDataRef = useRef<Uint8Array | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const visStreamRef = useRef<MediaStream | null>(null);
  const barsRef = useRef<HTMLSpanElement[]>([]);

  const clampedBase = Math.min(0.95, Math.max(0, baseScale));
  const H = heightPx ?? 16;

  const start = async () => {
    try {
      /* 1. 마이크 스트림 세팅 */
      if (audioCtxRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      visStreamRef.current = stream;
      /* 2. AudioContext 생성 후 소스 노드 생성 */
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AC();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      /* 3. createAnalyser()로 분석 노드 붙이고 파라미터 설정 */
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64; // 해상도 파라미터(크게하면 정밀하지만 반응이 느림) 유효 값: 32, 64, 128, 256, 512, 1024
      analyser.smoothingTimeConstant = 0.8; //시간적으로 값이 덜 변동되게 하는 파라미터
      source.connect(analyser);
      analyserRef.current = analyser;
      /* 4. 주파수 데이터를 담을 배열 생성 */
      const data = new Uint8Array(analyser.frequencyBinCount);
      freqDataRef.current = data;
      /* 5. 매 프레임마다 막대 그리기 */
      const draw = () => {
        const a = analyserRef.current; //분석 노드
        const d = freqDataRef.current; // 주파수 데이터
        if (!a || !d) return;
        a.getByteFrequencyData(d); // 주파수 데이터를 배열에 담기
        const binSize = Math.max(1, Math.floor(d.length / barsCount)); // 한 막대가 담당할 원시 주파수 범위
        //
        for (let i = 0; i < barsCount; i++) {
          let sum = 0;
          const start = i * binSize; // 막대가 담당할 주파수 범위 시작점
          const end = i === barsCount - 1 ? d.length : start + binSize; // 막대가 담당할 주파수 범위 끝점
          for (let j = start; j < end; j++) sum += d[j];
          const avg = sum / (end - start); // 평균 주파수 계산
          const norm = avg / 255; // 0~255 사이의 값을 0~1로 정규화
          const scale = Math.max(clampedBase, norm); // 너무 낮은 소리는 baseScale로 고정
          const el = barsRef.current[i]; // 막대 요소에 연결
          if (el) {
            const px = Math.max(4, Math.round(H * scale));
            el.style.height = `${px}px`; // 높이 직접 조절
          }
        }
        rafIdRef.current = requestAnimationFrame(draw);
      };
      rafIdRef.current = requestAnimationFrame(draw); // 첫 번째 프레임 그리기
    } catch (_) {
      console.error('비주얼라이저 오류 발생');
    }
  };

  // 사용한 리소스들 해제
  const stop = () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = null;
    try {
      if (audioCtxRef.current) audioCtxRef.current.close();
    } catch (_) {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    freqDataRef.current = null;
    if (visStreamRef.current) {
      visStreamRef.current.getTracks().forEach((t) => t.stop());
      visStreamRef.current = null;
    }
    // 막대 높이 초기화
    for (let i = 0; i < barsRef.current.length; i++) {
      const el = barsRef.current[i];
      if (el) {
        const px = Math.max(4, Math.round(H * clampedBase));
        el.style.height = `${px}px`;
      }
    }
  };

  useEffect(() => {
    if (active) start();
    else stop();
    return () => stop();
  }, [active]);

  return (
    <div className="flex items-center gap-[3px]" style={{ height: `${H}px` }}>
      {Array.from({ length: barsCount }).map((_, barIndex) => {
        return (
          <span
            key={barIndex}
            ref={(el) => {
              if (el) barsRef.current[barIndex] = el;
            }}
            className="w-[4px] bg-[#3B82F6] rounded-full transition-[height] duration-300 ease-out"
            style={{
              height: `${Math.max(4, Math.round(H * clampedBase))}px`,
            }}
          />
        );
      })}
    </div>
  );
}
