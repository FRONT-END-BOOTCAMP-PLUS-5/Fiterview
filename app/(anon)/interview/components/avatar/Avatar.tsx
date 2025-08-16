'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const CONTINUOUS_SLOW_BLINK = false;
const BLINK_MAX = 1;

interface AvatarProps {
  url: string;
  analyser: React.MutableRefObject<AnalyserNode | null>;
  timeBuf: React.MutableRefObject<Uint8Array | null>;
  onEnergy?: (v: number) => void;
  playing?: boolean;
}

type Target = {
  mesh: THREE.Mesh;
  dict: Record<string, number>;
  infl: number[];
  baseline: Float32Array;
  controlIdx: number[];
};

type BlinkParams = {
  closeDur: number;
  holdDur: number;
  openDur: number;
  amp: number;
  isDouble: boolean;
  secondQueued: boolean;
};

type BlinkState = {
  tNext: number;
  tNow: number;
  phase: number;
  params: BlinkParams;
};

export default function Avatar({ url, analyser, timeBuf, onEnergy, playing = false }: AvatarProps) {
  const gltf = useGLTF(url);

  const targetsRef = useRef<Target[]>([]);
  const jawBoneRef = useRef<THREE.Object3D | null>(null);
  const headBoneRef = useRef<THREE.Object3D | null>(null);
  const neckBoneRef = useRef<THREE.Object3D | null>(null);
  const spineBoneRef = useRef<THREE.Object3D | null>(null);

  // 눈 깜박임용 인덱스 (좌우 통합)
  const blinkIdxRef = useRef<{
    eyes: Array<{ t: Target; i: number }>;
    openers: Array<{ t: Target; i: number }>;
  }>({
    eyes: [],
    openers: [],
  });

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
    const found: Target[] = [];
    let jawBone: THREE.Object3D | null = null;
    let headBone: THREE.Object3D | null = null;
    let neckBone: THREE.Object3D | null = null;
    let spineBone: THREE.Object3D | null = null;

    // 제어 키: 입 & viseme + 눈 깜박임
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
    // 다양한 모델에서의 블링크 키 대응 (대소문자/언더스코어/하이픈 무시)
    const normalize = (s: string) => s.toLowerCase().replace(/[\s_\-]/g, '');

    // 이전 스캔 결과 초기화
    blinkIdxRef.current.eyes = [];
    blinkIdxRef.current.openers = [];

    const candidateBothEyes: Array<{ t: Target; i: number }> = [];
    const blinkCandidates = new Set<string>();

    const seenMorphKeys = new Set<string>();
    // 모델에서 확인한 정확한 키 이름 기준 매핑
    const exactBlinkKeys = new Set<string>(['eyeBlinkLeft', 'eyeBlinkRight']);
    const exactOpenKeys = new Set<string>(['eyeWideLeft', 'eyeWideRight']);

    gltf.scene.traverse((obj: any) => {
      // 본 탐색
      if (obj.isBone) {
        if (!jawBone && /(^|_)jaw/i.test(obj.name)) jawBone = obj;
        if (!headBone && /head/i.test(obj.name)) headBone = obj;
        if (!neckBone && /neck/i.test(obj.name)) neckBone = obj;
        if (!spineBone && /spine/i.test(obj.name)) spineBone = obj;
      }

      // morphTargets 탐색
      if (obj.morphTargetDictionary && obj.morphTargetInfluences) {
        const mesh = obj as THREE.Mesh;
        const dict = mesh.morphTargetDictionary;
        const infl = mesh.morphTargetInfluences;

        if (!dict || !infl) return;

        const target: Target = {
          mesh,
          dict,
          infl,
          baseline: new Float32Array(infl),
          controlIdx: [],
        };

        // 입 모프 인덱스 수집
        mouthKeys.forEach((k) => {
          const i = dict[k];
          if (i !== undefined) target.controlIdx.push(i);
        });

        // 눈 깜빡임 인덱스 수집(정확한 키 우선, 그 다음 정규식 후보)
        Object.entries(dict).forEach(([key, idx]) => {
          const nk = normalize(key);
          seenMorphKeys.add(key);
          if (exactBlinkKeys.has(key)) {
            blinkIdxRef.current.eyes.push({ t: target, i: idx });
          } else if (/(blink|eyesclosed|eyeclose|eyelidclose)/.test(nk)) {
            candidateBothEyes.push({ t: target, i: idx });
            blinkCandidates.add(key);
          } else if (
            exactOpenKeys.has(key) ||
            /(eyeopen|eyewide|lidup|upperlid(up|raise)?|openeye|eyeup)/.test(nk)
          ) {
            blinkIdxRef.current.openers.push({ t: target, i: idx });
          }
        });
        // Fallback: 눈 블링크 키를 못 찾은 경우 공통 후보 사용
        if (blinkIdxRef.current.eyes.length === 0) {
          candidateBothEyes.forEach((entry) => {
            blinkIdxRef.current.eyes.push(entry);
          });
          if (candidateBothEyes.length === 0) {
            console.warn(
              '[Avatar] Blink morph not found. Available morph keys:',
              Array.from(seenMorphKeys)
            );
          }
        }

        if (target.controlIdx.length > 0) found.push(target);
      }
    });

    targetsRef.current = found;
    jawBoneRef.current = jawBone;
    headBoneRef.current = headBone;
    neckBoneRef.current = neckBone;
    spineBoneRef.current = spineBone;
    const allKeys = Array.from(seenMorphKeys).sort();
    const blinkKeys = Array.from(blinkCandidates).sort();
    console.group('[Avatar] Morph discovery');
    console.log('All morph keys (unique):', allKeys);
    console.log('Blink candidate keys (regex):', blinkKeys);
    console.log('Blink indices (collected):', { eyes: blinkIdxRef.current.eyes.length });
    console.groupEnd();
    // 모델/모프 스캔 직후 첫 깜빡임 트리거
    blinkState.current.tNow = 0;
    blinkState.current.phase = 0;
    blinkState.current.tNext = 0.01;
  }, [gltf.scene]);

  // 오디오 에너지 계산
  const getEnergy = () => {
    const an = analyser.current;
    const tb = timeBuf.current;
    if (!an || !tb) return 0;

    // WebAudio API 타입 호환성을 위한 타입 단언
    const audioBuffer = tb.buffer as ArrayBuffer;
    const compatibleArray = new Uint8Array(audioBuffer);
    an.getByteTimeDomainData(compatibleArray);

    // 원본 배열에 데이터 복사
    tb.set(compatibleArray);

    let sum = 0;
    for (let i = 0; i < tb.length; i++) {
      const v = (tb[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / tb.length);
    return rms;
  };

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
      e = getEnergy() * GAIN;
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
    const tgs = targetsRef.current;
    if (!playing && mouth.current < 0.001) {
      for (const ttt of tgs) {
        for (let i = 0; i < ttt.infl.length; i++) ttt.infl[i] = ttt.baseline[i];
      }
    }
    for (const ttt of tgs) {
      const inv: string[] = [];
      Object.entries(ttt.dict).forEach(([k, i]) => (inv[i] = k));
      for (const idx of ttt.controlIdx) {
        const key = inv[idx] || '';
        const scale =
          key === 'jawOpen'
            ? 0.45
            : key === 'mouthOpen'
              ? 0.08
              : key.startsWith('viseme_')
                ? 1.0
                : 1.0;
        ttt.infl[idx] = ttt.baseline[idx] + mouth.current * scale * (1 - ttt.baseline[idx]);
      }
    }

    // --- 3) 턱 본 보정 ---
    const jaw = jawBoneRef.current;
    if (jaw) {
      jaw.rotation.x = -mouth.current * 0.2;
      jaw.position.y = -mouth.current * 0.004;
    }

    // --- 4) Idle 모션 ---
    const head = headBoneRef.current || neckBoneRef.current;
    const spine = spineBoneRef.current;

    const nod = Math.sin(t * 1.1 + idleSeed.current) * THREE.MathUtils.degToRad(1.2);
    const tilt = Math.sin(t * 0.8 + 1.7 + idleSeed.current) * THREE.MathUtils.degToRad(0.8);
    if (head) {
      head.rotation.x = (head.rotation.x || 0) * 0.9 + nod * 0.1; // 고개 끄덕임
      head.rotation.z = (head.rotation.z || 0) * 0.9 + tilt * 0.1; // 고개 기울임
    }
    if (spine) {
      const sway = Math.sin(t * 0.6 + 0.5 + idleSeed.current) * THREE.MathUtils.degToRad(0.6);
      spine.rotation.y = (spine.rotation.y || 0) * 0.9 + sway * 0.1; // 몸통 흔들림
      spine.position.z = (spine.position.z || 0) * 0.9 + Math.sin(t * 0.7) * 0.002;
    }

    // --- 5) 눈 깜박임 ---
    const bs = blinkState.current; //깜박임 추적
    bs.tNow += state.clock.getDelta(); //시간계산

    // 사람다운 깜박임 파라미터 샘플링
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
      const isDouble = Math.random() < 0.03; // 더블 확률 크게 감소

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
        const maxAmt = 0.95; // 느리게 꽤 많이 감김
        const contAmt = minAmt + (maxAmt - minAmt) * phase;
        setBlinkAmountLR(contAmt, contAmt);
        return;
      }

      //easeAmt: 깜박임 효과를 부드럽게 하는 함수
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
          const base = 0.08 + Math.random() * 0.4; // 0.8 ~ 1.6s
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
