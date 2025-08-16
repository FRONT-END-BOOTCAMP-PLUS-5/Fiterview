'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { AvatarProps, Target, BlinkParams, BlinkState, BlinkIndices } from './types';
import {
  BLINK_MAX,
  CONTINUOUS_SLOW_BLINK,
  sampleBlinkParams,
  setBlinkAmountUnified,
} from './blink';
import { scanMorphs } from './morphScanner';
import { getEnergy } from './audio';
import { collectMouthControlIndices, applyMouthMorphs, adjustJawBone } from './mouth';
import { applyIdleMotion } from './idle';

export default function Avatar({ url, analyser, timeBuf, onEnergy, playing = false }: AvatarProps) {
  const gltf = useGLTF(url);

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
    const bs = blinkState.current; //깜박임 추적
    bs.tNow += state.clock.getDelta(); //시간계산

    // 깜박임 파라미터 샘플링
    const sampleBlinkParams = (isPlaying: boolean, mouthAmt: number): BlinkParams => {
      // 기본 지속시간(초)
      const closeDur = THREE.MathUtils.clamp(0.003 + Math.random() * 0.002, 0.003, 0.005); // 매우 빠른 닫힘
      const holdDur = THREE.MathUtils.clamp(0.0 + Math.random() * 0.005, 0.0, 0.006); // 거의 유지 없음
      const openDur = THREE.MathUtils.clamp(0.005 + Math.random() * 0.003, 0.005, 0.008); // 매우 빠른 열림

      // 부분 깜빡임(약 20%). 양쪽 동일 강도로 적용
      const isPartial = Math.random() < 0.2;
      const baseAmp = isPartial ? 0.4 + Math.random() * 0.45 : 1.0;
      const amp = THREE.MathUtils.clamp(baseAmp, 0, 1);

      // 더블 블링크(약 12%)
      const isDouble = Math.random() < 0.03;

      return {
        closeDur,
        holdDur,
        openDur,
        amp,
        isDouble,
        secondQueued: false,
      };
    };

    const setBlinkAmountLR = (amtL: number, amtR: number) => {
      if (!blinkIdxRef.current) {
        console.error('blinkIdxRef.current is not defined');
        return;
      }

      if (CONTINUOUS_SLOW_BLINK) {
        const phase = 0.5 + 0.5 * Math.sin(t * 10.5 + idleSeed.current);
        const minAmt = 0.05; // 거의 다 뜬 상태
        const maxAmt = 0.95;
        const contAmt = minAmt + (maxAmt - minAmt) * phase;
        setBlinkAmountLR(contAmt, contAmt);
        return;
      }

      //smoothAmt: 깜박임 효과를 부드럽게 하는 함수
      const smoothAmt = amtL * amtL * (3 - 2 * amtL); // 좌우 동일
      // 양쪽 눈을 통합 목록으로 동일 적용
      blinkIdxRef.current.eyes.forEach(({ t, i }) => {
        if (t.mesh.morphTargetInfluences) {
          t.mesh.morphTargetInfluences[i] = THREE.MathUtils.lerp(
            t.baseline[i],
            BLINK_MAX,
            smoothAmt
          );
        }
      });
      // 눈을 여는 계열 모프 억제
      blinkIdxRef.current.openers.forEach(({ t, i }) => {
        if (t.mesh.morphTargetInfluences) {
          t.mesh.morphTargetInfluences[i] = THREE.MathUtils.lerp(t.baseline[i], 0, smoothAmt);
        }
      });
    };

    // 대기 → 깜박임 시작 트리거(무작위 간격, 발화 시 약간 딜레이)
    if (bs.phase === 0 && bs.tNow >= bs.tNext) {
      bs.params = sampleBlinkParams(playing, mouth.current);
      bs.phase = 1;
      bs.tNow = 0;
    }

    //깜박임 시작
    if (bs.phase === 1) {
      // 닫기 단계
      const { closeDur, amp } = bs.params;
      const p = THREE.MathUtils.clamp(bs.tNow / closeDur, 0, 1);
      const amt = THREE.MathUtils.clamp(p * amp, 0, 1);
      setBlinkAmountLR(amt, amt);

      if (amt >= amp) {
        bs.phase = 2; // 감긴 상태 유지
        bs.tNow = 0;
      }
    } else if (bs.phase === 2) {
      // 감긴 상태 유지
      const { holdDur, amp } = bs.params;
      setBlinkAmountLR(amp, amp);
      if (bs.tNow >= holdDur) {
        bs.phase = 3; // 열기 단계로 전환
        bs.tNow = 0;
      }
    } else if (bs.phase === 3) {
      // 열기 단계
      const { openDur, amp, isDouble, secondQueued } = bs.params;
      const p = THREE.MathUtils.clamp(bs.tNow / openDur, 0, 1);
      const amt = Math.max(0, amp * (1 - p));
      setBlinkAmountLR(amt, amt);

      if (amt <= 0.001) {
        // 더블 블링크 처리
        if (isDouble && !secondQueued) {
          const second: BlinkParams = {
            ...bs.params,
            closeDur: Math.max(0.04, bs.params.closeDur * 0.6),
            holdDur: Math.max(0.01, bs.params.holdDur * 0.6),
            openDur: Math.max(0.06, bs.params.openDur * 0.7),
            amp: Math.min(1, bs.params.amp * 0.8),
            isDouble: true,
            secondQueued: true,
          };
          bs.params = second;
          bs.phase = 1;
          bs.tNow = 0;
        } else {
          bs.phase = 0;
          bs.tNow = 0;
          // 다음 깜박임 시점(짧은 주기 + 발화 시 소폭 지연)
          const base = 0.08 + Math.random() * 0.4;
          const speakingDelay = playing && mouth.current > 0.2 ? 0.1 + Math.random() * 0.2 : 0;
          bs.tNext = base + speakingDelay;
        }
      }
    }
  });

  return (
    <group>
      <primitive object={gltf.scene} position={[0, -1.59, -1]} scale={[2, 2, 2]} />
      {/* 디버그용 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="green" />
      </mesh>
    </group>
  );
}
