'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { AvatarProps, Target, BlinkParams, BlinkState, BlinkIndices } from './types';
import { scanMorphs } from './morphScanner';
import { getEnergy } from './audio';
import { collectMouthControlIndices, applyMouthMorphs, adjustJawBone } from './mouth';
import { advanceBlink } from './blinkMachine';
import { applyIdleMotion } from './idle';

export default function Avatar({ url, analyser, timeBuf, onEnergy, playing = false }: AvatarProps) {
  const modelUrl = useMemo(() => {
    const raw = (url as string).trim();
    if (!raw) return url as string;
    const isFull = raw.startsWith('http://') || raw.startsWith('https://');
    const base = isFull ? raw : `https://models.readyplayer.me/${raw}.glb`;
    const hasQuery = base.includes('?');
    const q = 'morphTargets=ARKit,Oculus%20Visemes';
    const finalUrl = base + (hasQuery ? (base.includes('morphTargets=') ? '' : `&${q}`) : `?${q}`);
    return finalUrl;
  }, [url]);

  const gltf = useGLTF(modelUrl);

  const targetsRef = useRef<Target[]>([]);
  const jawBoneRef = useRef<THREE.Object3D | null>(null);
  const headBoneRef = useRef<THREE.Object3D | null>(null);
  const neckBoneRef = useRef<THREE.Object3D | null>(null);
  const spineBoneRef = useRef<THREE.Object3D | null>(null);

  // 눈 깜박임용 인덱스 (좌우 통합)
  const blinkIdxRef = useRef<BlinkIndices>({ eyes: [], openers: [] });

  const prevPlaying = useRef<boolean>(false);
  const mouth = useRef(0);

  // --- 깜박임/idle용 상태 ---
  const blinkState = useRef<BlinkState>({
    tNext: 0.8 + Math.random() * 0.8, // 0.8~1.6초 사이
    tNow: 0,
    phase: 0,
    params: {
      closeDur: 0.12,
      holdDur: 0.06,
      openDur: 0.18,
      amp: 1,
      isDouble: false,
      secondQueued: false,
    },
  });

  const idleSeed = useRef(Math.random() * 1000);

  useEffect(() => {
    const mouthKeys = [
      'jawOpen',
      'viseme_CH',
      'viseme_DD',
      'viseme_E',
      'viseme_FF',
      'viseme_I',
      'viseme_O',
      'viseme_PP',
      'viseme_RR',
      'viseme_SS',
      'viseme_TH',
      'viseme_U',
      'viseme_aa',
      'viseme_kk',
      'viseme_nn',
      'viseme_sil',
    ];

    const { targets, indices, seen } = scanMorphs(gltf.scene, ({ jaw, head, neck, spine }) => {
      jawBoneRef.current = jaw;
      headBoneRef.current = head;
      neckBoneRef.current = neck;
      spineBoneRef.current = spine;
    });

    collectMouthControlIndices(targets);

    targetsRef.current = targets;
    blinkIdxRef.current = indices;

    blinkState.current.tNow = 0;
    blinkState.current.phase = 0;
    blinkState.current.tNext = 0.01;
  }, [gltf.scene]);

  // 오디오 에너지 계산
  const getEnergyLocal = () => getEnergy(analyser.current, timeBuf.current);

  // --- 재생 → 정지로 바뀔 때 입/턱 리셋 ---
  useEffect(() => {
    if (prevPlaying.current && !playing) {
      for (const t of targetsRef.current) {
        for (let i = 0; i < t.infl.length; i++) t.infl[i] = t.baseline[i];
      }
      const jaw = jawBoneRef.current;
      if (jaw) {
        jaw.rotation.set(0, 0, 0);
        jaw.position.set(0, 0, 0);
      }
    }
    prevPlaying.current = playing;
  }, [playing]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const GAIN = 0.2; //벌리는 입 크기
    const OPEN_TH = 0.02;
    const CLOSE_TH = 0.015;
    const ATTACK = 0.3;
    const RELEASE = 0.15;

    // --- 1) 오디오 기반 입 벌림 ---
    let e = 0;
    if (playing) {
      e = getEnergyLocal() * GAIN;
      if (e > OPEN_TH) {
        mouth.current += (e - mouth.current) * ATTACK;
      } else if (e < CLOSE_TH) {
        mouth.current += (0 - mouth.current) * RELEASE;
      }
    } else {
      mouth.current += (0 - mouth.current) * RELEASE;
    }
    mouth.current = Math.max(0, Math.min(1, mouth.current));
    if (playing) mouth.current = Math.max(0.02, mouth.current);

    if (onEnergy) onEnergy(mouth.current);

    // --- 2) 모프 적용(입) ---
    applyMouthMorphs(targetsRef.current, mouth.current, playing);

    // --- 3) 턱 본 보정 ---
    adjustJawBone(jawBoneRef.current, mouth.current);

    // --- 4) Idle 모션 ---
    applyIdleMotion(
      headBoneRef.current || neckBoneRef.current,
      spineBoneRef.current,
      t,
      idleSeed.current
    );

    // --- 5) 눈 깜박임 ---
    advanceBlink(blinkState.current, state.clock.getDelta(), blinkIdxRef.current, {
      t,
      idleSeed: idleSeed.current,
      playing,
      mouth: mouth.current,
    });
  });

  return (
    <group>
      <primitive object={gltf.scene} position={[0, -3.158, -1.5]} scale={[2, 2, 2]} />
      {/* 디버그용 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="green" />
      </mesh>
    </group>
  );
}
