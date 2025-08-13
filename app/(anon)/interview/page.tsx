'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';

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
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    onPickFile(e.dataTransfer.files?.[0]);
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

  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl]
  );

  return (
    <div className="min-h-screen w-full flex flex-col gap-4 p-6 bg-neutral-950 text-white">
      <h1 className="text-xl md:text-2xl font-semibold">
        Zoom-like Avatar (Upper body, HDR, Idle)
      </h1>

      {/* 컨트롤 */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm text-neutral-300">Ready Player Me GLB URL 또는 avatarId</span>
          <input
            className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 outline-none"
            value={avatarInput}
            onChange={(e) => setAvatarInput(e.target.value)}
            placeholder="https://models.readyplayer.me/<id>.glb"
          />
          <span className="text-xs text-neutral-500 break-all">Using: {modelUrl}</span>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-neutral-300">
            오디오 파일 (mp3/wav/ogg) – 드롭 또는 선택
          </span>
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900 p-3 flex flex-col gap-2 items-center justify-center text-neutral-400"
          >
            <input
              id="audioFile"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
            <label
              htmlFor="audioFile"
              className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 cursor-pointer hover:bg-neutral-700"
            >
              파일 선택
            </label>
            <span className="text-xs">또는 여기로 드래그 앤 드롭</span>
            {fileName && <span className="text-xs text-emerald-400">선택됨: {fileName}</span>}
          </div>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto flex items-center gap-3">
        <audio
          ref={audioRef}
          src={objectUrl || undefined}
          controls
          className="w-80"
          onPlay={() => {
            startAudioCtx();
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
        <button
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          onClick={startAudioCtx}
          disabled={ctxReady}
        >
          {ctxReady ? 'AudioContext Ready' : 'Enable AudioContext'}
        </button>
        {/* 에너지 디버그 바 */}
        <div className="h-2 w-48 bg-neutral-800 rounded overflow-hidden border border-neutral-700">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${Math.min(100, Math.round(energyUI * 160))}%` }}
          />
        </div>
      </section>

      {/* Zoom 면접 레이아웃: 좌측 아바타(상반신 고정) / 우측 자리 표시 */}
      <main className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-black h-[58vh]">
          <div className="absolute z-10 left-3 top-3 px-2 py-1 text-xs rounded bg-neutral-800/80 border border-neutral-700">
            Interviewer
          </div>
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

          <div className="absolute right-3 bottom-3 text-xs px-2 py-1 rounded bg-neutral-800/80 border border-neutral-700">
            {objectUrl
              ? ctxReady
                ? 'Audio linked (RMS)'
                : 'Ready – enable AudioContext'
              : 'No audio file'}
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 h-[58vh] flex items-center justify-center">
          <div className="absolute z-10 left-3 top-3 px-2 py-1 text-xs rounded bg-neutral-800/80 border border-neutral-700">
            You
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-3xl font-semibold">
              YOU
            </div>
            <div className="text-neutral-400 text-sm">Camera is off</div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ======================= Avatar ======================= */
function Avatar({
  url,
  analyser,
  timeBuf,
  onEnergy,
  playing = false,
}: {
  url: string;
  analyser: React.MutableRefObject<AnalyserNode | null>;
  timeBuf: React.MutableRefObject<Uint8Array | null>;
  onEnergy?: (v: number) => void;
  playing?: boolean;
}) {
  const gltf = useGLTF(url);

  // 모델 로딩 상태 로그
  useEffect(() => {
    console.log('🔄 GLTF Loading:', url);
    console.log('✅ GLTF Loaded:', gltf.scene);
    console.log('📊 Scene children:', gltf.scene.children.length);
  }, [url, gltf.scene]);

  type Target = {
    mesh: THREE.Mesh;
    dict: Record<string, number>;
    infl: number[];
    baseline: Float32Array; // 로드 시점의 기본값 복사
    controlIdx: number[]; // 우리가 제어할 인덱스(입/눈 등)
  };

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
      // 본 탐색(이름이 모델마다 다르므로 느슨한 정규식)
      if (obj.isBone) {
        if (!jawBone && /(^|_)jaw/i.test(obj.name)) jawBone = obj;
        if (!headBone && /head/i.test(obj.name)) headBone = obj;
        if (!neckBone && /neck/i.test(obj.name)) neckBone = obj;
        if (!spineBone && /spine|chest/i.test(obj.name)) spineBone = obj;
      }

      // 모프 타깃
      if (obj.isMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
        const dict = obj.morphTargetDictionary as Record<string, number>;
        const infl = obj.morphTargetInfluences as number[];

        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m: any) => {
          if (m && 'morphTargets' in m) m.morphTargets = true;
          if (m && 'morphNormals' in m) m.morphNormals = true;
          if (m) m.needsUpdate = true;
        });

        const controlIdx = mouthKeys
          .map((k) => (dict[k] !== undefined ? dict[k] : -1))
          .filter((i) => i >= 0);

        const baseline = new Float32Array(infl.length);
        for (let i = 0; i < infl.length; i++) baseline[i] = infl[i] ?? 0;

        const target: Target = { mesh: obj, dict, infl, baseline, controlIdx };
        found.push(target);

        // 눈 깜박임 인덱스 수집
        blinkKeysLeft.forEach((k) => {
          const i = dict[k];
          if (i !== undefined) blinkIdxRef.current.left.push({ t: target, i });
        });
        blinkKeysRight.forEach((k) => {
          const i = dict[k];
          if (i !== undefined) blinkIdxRef.current.right.push({ t: target, i });
        });
      }
    });

    targetsRef.current = found;
    jawBoneRef.current = jawBone;
    headBoneRef.current = headBone;
    neckBoneRef.current = neckBone;
    spineBoneRef.current = spineBone;
  }, [gltf.scene]);

  // --- 오디오 에너지 계산(주파수 평균) ---
  const freqBufRef = useRef<Uint8Array | null>(null);
  const mouth = useRef(0);
  const ATTACK = 0.25,
    RELEASE = 0.6;
  const OPEN_TH = 0.001,
    CLOSE_TH = 0.001;
  const GAIN = 0.6;

  const getEnergy = () => {
    const an = analyser.current;
    if (!an) return 0;
    if (!freqBufRef.current || freqBufRef.current.length !== an.frequencyBinCount) {
      freqBufRef.current = new Uint8Array(an.frequencyBinCount);
    }
    const fb = freqBufRef.current;
    an.getByteFrequencyData(fb);
    let sum = 0;
    for (let i = 0; i < fb.length; i++) sum += fb[i];
    const e = sum / fb.length / 255; // 0~1
    onEnergy?.(e);
    return e;
  };

  // --- 깜박임/idle용 상태 ---
  const blinkState = useRef({
    tNext: 1 + Math.random() * 3, // 다음 깜박임까지 남은 시간(초)
    tNow: 0, // 누적 시간
    phase: 0, // 0:열림, 1:닫힘 진행, 2:열림 진행
  });

  const idleSeed = useRef(Math.random() * 1000);

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

  // 미리 로드
  useGLTF.preload(
    'https://models.readyplayer.me/6899e9b67c6c17df667879ee.glb?morphTargets=ARKit,Oculus%20Visemes'
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

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

    // --- 4) Idle 모션(재생 여부와 무관하게 항상 동작) ---
    const head = headBoneRef.current || neckBoneRef.current;
    const spine = spineBoneRef.current;

    // (a) 아주 미세한 고개 끄덕임(저주파 사인)
    const nod = Math.sin(t * 1.1 + idleSeed.current) * THREE.MathUtils.degToRad(1.2);
    // (b) 좌우 흔들림 살짝
    const tilt = Math.sin(t * 0.8 + 1.7 + idleSeed.current) * THREE.MathUtils.degToRad(0.8);
    if (head) {
      head.rotation.x = (head.rotation.x || 0) * 0.9 + nod * 0.1;
      head.rotation.z = (head.rotation.z || 0) * 0.9 + tilt * 0.1;
    }
    if (spine) {
      // 상체 호흡/스웨이
      const sway = Math.sin(t * 0.6 + 0.5 + idleSeed.current) * THREE.MathUtils.degToRad(0.6);
      spine.rotation.y = (spine.rotation.y || 0) * 0.9 + sway * 0.1;
      spine.position.z = (spine.position.z || 0) * 0.9 + Math.sin(t * 0.7) * 0.002;
    }

    // --- 5) 눈 깜박임(확률적 타이밍) ---
    const BLINK_SPEED = 16; // 높을수록 빠르게
    const bs = blinkState.current;
    bs.tNow += state.clock.getDelta();

    if (bs.phase === 0 && bs.tNow >= bs.tNext) {
      bs.phase = 1; // 닫힘 시작
      bs.tNow = 0;
    }

    const setBlinkAmount = (amt: number) => {
      // 0(열림) ~ 1(완전 닫힘)
      blinkIdxRef.current.left.forEach(({ t, i }) => {
        t.infl[i] = THREE.MathUtils.lerp(t.baseline[i] || 0, 1, amt);
      });
      blinkIdxRef.current.right.forEach(({ t, i }) => {
        t.infl[i] = THREE.MathUtils.lerp(t.baseline[i] || 0, 1, amt);
      });
    };

    if (bs.phase === 1) {
      const amt = Math.min(1, bs.tNow * BLINK_SPEED * 0.06);
      setBlinkAmount(amt);
      if (amt >= 1) {
        bs.phase = 2; // 열림 시작
        bs.tNow = 0;
      }
    } else if (bs.phase === 2) {
      const amt = Math.max(0, 1 - bs.tNow * BLINK_SPEED * 0.06);
      setBlinkAmount(amt);
      if (amt <= 0) {
        bs.phase = 0;
        bs.tNow = 0;
        bs.tNext = 1.5 + Math.random() * 3.0; // 다음 깜박임까지 대기
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
  ); // 상반신이 카메라에 잘 들어오도록 살짝 내림
}
import 'three/examples/jsm/loaders/GLTFLoader';
