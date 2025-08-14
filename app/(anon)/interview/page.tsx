'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import Avatar from './components/avatar/Avatar';
import AudioControls from './components/AudioControls';
import AvatarSettings from './components/AvatarSettings';
import InterviewLayout from './components/InterviewLayout';

/**
 * 녹음/TTS 파일(오디오 파형)만으로 입 여닫기 (비지음/Viseme 불필요)
 * + 줌 면접 레이아웃(상반신 고정) + HDR 배경 + idle(끄덕임/스웨이/깜박임)
 */
export default function Page() {
  // Ready Player Me GLB (필수: morphTargets 쿼리로 입/눈 모프 포함)
  const [avatarInput, setAvatarInput] = useState(
    'https://models.readyplayer.me/689bfc8a7c6c17df66adf1c9.glb'
  );

  const modelUrl = useMemo(() => {
    const raw = avatarInput.trim();
    const isFull = raw.startsWith('http://') || raw.startsWith('https://');
    const base = isFull ? raw : `https://models.readyplayer.me/${raw}.glb`;
    const hasQuery = base.includes('?');
    const q = 'morphTargets=ARKit,Oculus%20Visemes';
    const finalUrl = base + (hasQuery ? (base.includes('morphTargets=') ? '' : `&${q}`) : `?${q}`);
    console.log('🔗 Model URL:', finalUrl);
    return finalUrl;
  }, [avatarInput]);

  // 오디오 파일 업로드/재생
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [objectUrl, setObjectUrl] = useState('');

  // WebAudio 분석기
  const [ctxReady, setCtxReady] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timeBufRef = useRef<Uint8Array | null>(null);
  const [energyUI, setEnergyUI] = useState(0); // 디버그 바
  const [playing, setPlaying] = useState(false);

  const onPickFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
  };

  const startAudioCtx = () => {
    if (ctxReady) return;
    const el = audioRef.current;
    if (!el) return;
    const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const src = ctx.createMediaElementSource(el);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.3;
    const tbuf = new Uint8Array(analyser.fftSize);
    src.connect(analyser).connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    timeBufRef.current = tbuf;
    setCtxReady(true);
  };

  const handlePlay = () => {
    startAudioCtx();
    setPlaying(true);
  };

  const handlePause = () => setPlaying(false);
  const handleEnded = () => setPlaying(false);

  // 메모리 정리
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return (
    <div className="min-h-screen w-full flex flex-col gap-4 p-6 bg-neutral-950 text-white">
      <h1 className="text-xl md:text-2xl font-semibold">
        Zoom-like Avatar (Upper body, HDR, Idle)
      </h1>

      {/* 컨트롤 섹션 */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
        <AvatarSettings
          avatarInput={avatarInput}
          modelUrl={modelUrl}
          onAvatarInputChange={setAvatarInput}
        />

        <AudioControls
          fileName={fileName}
          objectUrl={objectUrl}
          ctxReady={ctxReady}
          energyUI={energyUI}
          audioRef={audioRef}
          onPickFile={onPickFile}
          onStartAudioCtx={startAudioCtx}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
        />
      </section>

      {/* 인터뷰 레이아웃 */}
      <InterviewLayout objectUrl={objectUrl} ctxReady={ctxReady}>
        <Canvas
          camera={{ fov: 22, position: [0, 1.55, 1.05] /* 상반신 클로즈업 */ }}
          shadows
          onCreated={(state) => {
            console.log('🎨 Canvas created:', state);
          }}
        >
          {/* 회사 스튜디오 HDR 배경 */}
          <Environment files="/poly_haven_studio_4k.hdr" background />

          {/* 기본 조명(환경광만으로도 충분하지만 보정) */}
          <hemisphereLight args={[0xffffff, 0x404040, 0.6]} />
          <directionalLight position={[2, 5, 3]} intensity={0.8} castShadow />

          <Suspense
            fallback={
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="red" />
              </mesh>
            }
          >
            <Avatar
              url={modelUrl}
              analyser={analyserRef}
              timeBuf={timeBufRef}
              onEnergy={setEnergyUI}
              playing={playing}
            />
          </Suspense>

          {/* 화면/카메라 고정 */}
          <OrbitControls
            target={[0, 1.5, 0]}
            enableDamping
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Canvas>
      </InterviewLayout>
    </div>
  );
}
