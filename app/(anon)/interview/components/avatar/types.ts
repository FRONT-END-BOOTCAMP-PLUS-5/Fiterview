import * as THREE from 'three';

//아바타 컴포넌트
export interface AvatarProps {
  url: string;
  analyser: React.MutableRefObject<AnalyserNode | null>;
  timeBuf: React.MutableRefObject<Uint8Array | null>;
  onEnergy?: (v: number) => void;
  playing?: boolean;
}

//모프 타겟(딕션,베이스라인,컨트롤 인덱스 등등등)
export type Target = {
  mesh: THREE.Mesh;
  dict: Record<string, number>;
  infl: number[];
  baseline: Float32Array;
  controlIdx: number[];
};

//눈 깜빡임(닫힘/윶/열림 지속시간 + 더블 블링크크)
export type BlinkParams = {
  closeDur: number;
  holdDur: number;
  openDur: number;
  amp: number; // unified amplitude for both eyes
  isDouble: boolean;
  secondQueued: boolean;
};

//깜빡임 상태태
export type BlinkState = {
  tNext: number;
  tNow: number;
  phase: number; // 0 wait, 1 close, 2 hold, 3 open
  params: BlinkParams;
};

//깜빡임 인덱스(눈 깜빡임 인덱스 + 입 인덱스)
export type BlinkIndices = {
  eyes: Array<{ t: Target; i: number }>;
  openers: Array<{ t: Target; i: number }>;
};

//뼈(jaw/head/neck/spine)
export type Bones = {
  jawBone: THREE.Object3D | null;
  headBone: THREE.Object3D | null;
  neckBone: THREE.Object3D | null;
  spineBone: THREE.Object3D | null;
};
