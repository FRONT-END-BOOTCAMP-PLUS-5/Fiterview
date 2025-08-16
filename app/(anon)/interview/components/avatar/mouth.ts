import * as THREE from 'three';
import { Target } from './types';

export const MOUTH_KEYS: string[] = [
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

//입 모프 컨트롤 인덱스 수집 및 적용
export function collectMouthControlIndices(targets: Target[]): void {
  targets.forEach((t) => {
    MOUTH_KEYS.forEach((k) => {
      const i = t.dict[k];
      if (i !== undefined) t.controlIdx.push(i);
    });
  });
}

export function applyMouthMorphs(targets: Target[], mouthValue: number, playing: boolean): void {
  if (!playing && mouthValue < 0.001) {
    for (const t of targets) {
      for (let i = 0; i < t.infl.length; i++) t.infl[i] = t.baseline[i];
    }
    return;
  }

  for (const t of targets) {
    const inv: string[] = [];
    Object.entries(t.dict).forEach(([k, i]) => (inv[i] = k));
    for (const idx of t.controlIdx) {
      const key = inv[idx] || '';
      const scale =
        key === 'jawOpen'
          ? 0.45
          : key === 'mouthOpen'
            ? 0.08
            : key.startsWith('viseme_')
              ? 1.0
              : 1.0;
      t.infl[idx] = t.baseline[idx] + mouthValue * scale * (1 - t.baseline[idx]);
    }
  }
}

export function adjustJawBone(jaw: THREE.Object3D | null, mouthValue: number): void {
  if (!jaw) return;
  jaw.rotation.x = -mouthValue * 0.2;
  jaw.position.y = -mouthValue * 0.004;
}
