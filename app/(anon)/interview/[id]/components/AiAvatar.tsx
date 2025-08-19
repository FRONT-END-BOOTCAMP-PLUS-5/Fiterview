'use client';

import Avatar from './avatar/Avatar';
import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

export default function AiAvatar({
  ttsAudio,
  playing,
}: {
  ttsAudio: HTMLAudioElement | null;
  playing: boolean;
}) {
  // TTS 오디오 분석용
  const analyser = useRef<AnalyserNode | null>(null);
  const timeBuf = useRef<Uint8Array | null>(null);
  const [energy, setEnergy] = useState(0);

  useEffect(() => {
    if (!ttsAudio) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = ctx.createMediaElementSource(ttsAudio);
    analyser.current = ctx.createAnalyser();
    analyser.current.fftSize = 2048;
    timeBuf.current = new Uint8Array(analyser.current.fftSize);
    source.connect(analyser.current);
    analyser.current.connect(ctx.destination);
    return () => {
      source.disconnect();
      analyser.current?.disconnect();
      ctx.close();
    };
  }, [ttsAudio]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Canvas className="h-full w-full" camera={{ position: [0, 0, 0], fov: 35 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={0.7} />
        <Suspense fallback={null}>
          <Environment files="/poly_haven_studio_4k.hdr" background />
          <Avatar
            url="https://models.readyplayer.me/689d3904c911aabc2eba50a6.glb"
            analyser={analyser}
            timeBuf={timeBuf}
            playing={playing}
            onEnergy={setEnergy}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
