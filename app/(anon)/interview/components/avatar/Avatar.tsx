'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

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

export default function Avatar({ url, analyser, timeBuf, onEnergy, playing = false }: AvatarProps) {
  const gltf = useGLTF(url);

  const targetsRef = useRef<Target[]>([]);
  const jawBoneRef = useRef<THREE.Object3D | null>(null);
  const headBoneRef = useRef<THREE.Object3D | null>(null);
  const neckBoneRef = useRef<THREE.Object3D | null>(null);
  const spineBoneRef = useRef<THREE.Object3D | null>(null);

  // 눈 깜박임용 인덱스
  const blinkIdxRef = useRef<{
    left: Array<{ t: Target; i: number }>;
    right: Array<{ t: Target; i: number }>;
  }>({
    left: [],
    right: [],
  });

  const prevPlaying = useRef<boolean>(false);
  const mouth = useRef(0);

  // --- 깜박임/idle용 상태 ---
  const blinkState = useRef({
    tNext: 2 + Math.random() * 4,
    tNow: 0,
    phase: 0,
  });

  const idleSeed = useRef(Math.random() * 1000);

  // 모델 로딩 상태 로그
  useEffect(() => {
    console.log('🔄 GLTF Loading:', url);
    console.log('✅ GLTF Loaded:', gltf.scene);
    console.log('📊 Scene children:', gltf.scene.children.length);
  }, [url, gltf.scene]);

  useEffect(() => {
    const found: Target[] = [];
    let jawBone: THREE.Object3D | null = null;
    let headBone: THREE.Object3D | null = null;
    let neckBone: THREE.Object3D | null = null;
    let spineBone: THREE.Object3D | null = null;

    // 제어 키: 입 & viseme + 눈 깜박임
    const mouthKeys = [
      'jawOpen',
      'mouthOpen',
      'viseme_aa',
      'viseme_oh',
      'viseme_ih',
      'viseme_uh',
      'viseme_E',
      'viseme_I',
      'viseme_O',
      'viseme_U',
      'A',
      'aa',
    ];
    const blinkKeysLeft = ['eyeBlinkLeft', 'blink_left', 'eyeBlink_L'];
    const blinkKeysRight = ['eyeBlinkRight', 'blink_right', 'eyeBlink_R'];

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

        // 눈 깜박임 인덱스 수집
        blinkKeysLeft.forEach((k) => {
          const i = dict[k];
          if (i !== undefined) blinkIdxRef.current.left.push({ t: target, i });
        });
        blinkKeysRight.forEach((k) => {
          const i = dict[k];
          if (i !== undefined) blinkIdxRef.current.right.push({ t: target, i });
        });

        if (target.controlIdx.length > 0) found.push(target);
      }
    });

    targetsRef.current = found;
    jawBoneRef.current = jawBone;
    headBoneRef.current = headBone;
    neckBoneRef.current = neckBone;
    spineBoneRef.current = spineBone;
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
    const GAIN = 8.0;
    const OPEN_TH = 0.08;
    const CLOSE_TH = 0.04;
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
              ? 0.05
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
      head.rotation.x = (head.rotation.x || 0) * 0.9 + nod * 0.1;
      head.rotation.z = (head.rotation.z || 0) * 0.9 + tilt * 0.1;
    }
    if (spine) {
      const sway = Math.sin(t * 0.6 + 0.5 + idleSeed.current) * THREE.MathUtils.degToRad(0.6);
      spine.rotation.y = (spine.rotation.y || 0) * 0.9 + sway * 0.1;
      spine.position.z = (spine.position.z || 0) * 0.9 + Math.sin(t * 0.7) * 0.002;
    }

    // --- 5) 눈 깜박임 ---
    const BLINK_SPEED = 300;
    const bs = blinkState.current;
    bs.tNow += state.clock.getDelta();

    if (bs.phase === 0 && bs.tNow >= bs.tNext) {
      bs.phase = 1;
      bs.tNow = 0;
    }

    const setBlinkAmount = (amt: number) => {
      const easeAmt = amt < 0.5 ? 2 * amt * amt : 1 - Math.pow(-2 * amt + 2, 3) / 2;
      blinkIdxRef.current.left.forEach(({ t, i }) => {
        t.infl[i] = THREE.MathUtils.lerp(t.baseline[i] || 0, 1, easeAmt);
      });
      blinkIdxRef.current.right.forEach(({ t, i }) => {
        t.infl[i] = THREE.MathUtils.lerp(t.baseline[i] || 0, 1, easeAmt);
      });
    };

    if (bs.phase === 1) {
      const amt = Math.min(1, bs.tNow * BLINK_SPEED * 0.01);
      setBlinkAmount(amt);
      if (amt >= 1) {
        bs.phase = 2;
        bs.tNow = 0;
      }
    } else if (bs.phase === 2) {
      const amt = Math.max(0, 1 - bs.tNow * BLINK_SPEED * 0.015);
      setBlinkAmount(amt);
      if (amt <= 0) {
        bs.phase = 0;
        bs.tNow = 0;
        bs.tNext = 2.5 + Math.random() * 5.0;
      }
    }
  });

  return (
    <group>
      <primitive object={gltf.scene} position={[0, -1.56, -1]} scale={[2, 2, 2]} />
      {/* 디버그용: 아바타 위치에 작은 구 표시 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="green" />
      </mesh>
    </group>
  );
}
