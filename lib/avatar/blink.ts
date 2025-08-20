import { BlinkIndices, BlinkParams } from '@/types/avatar';
import * as THREE from 'three';

export const BLINK_MAX = 1.0;
export const CONTINUOUS_SLOW_BLINK = false;

//깜빡임 파라미터 샘플링 및 적용 유틸
export function sampleBlinkParams(isPlaying: boolean, mouthAmt: number): BlinkParams {
  // Faster blink timings (close/open significantly quicker)
  const closeDur = THREE.MathUtils.clamp(0.4 + Math.random() * 0.02, 0.08, 0.01);
  const holdDur = THREE.MathUtils.clamp(0.0 + Math.random() * 0.03, 0.0, 0.003);
  const openDur = THREE.MathUtils.clamp(0.04 + Math.random() * 0.07, 0.08, 0.15);

  const isPartial = Math.random() < 0.2;
  const baseAmp = isPartial ? 0.4 + Math.random() * 0.45 : 1.0;
  const amp = THREE.MathUtils.clamp(baseAmp, 0, 1);

  const isDouble = Math.random() < 0.03;

  return { closeDur, holdDur, openDur, amp, isDouble, secondQueued: false };
}

export function setBlinkAmountUnified(indices: BlinkIndices, amt: number) {
  const clamped = THREE.MathUtils.clamp(amt, 0, 1);
  const smooth = clamped * clamped * (3 - 2 * clamped);
  indices.eyes.forEach(({ t, i }) => {
    if (t.mesh.morphTargetInfluences) {
      t.mesh.morphTargetInfluences[i] = THREE.MathUtils.lerp(t.baseline[i], BLINK_MAX, smooth);
    }
  });
  indices.openers.forEach(({ t, i }) => {
    if (t.mesh.morphTargetInfluences) {
      t.mesh.morphTargetInfluences[i] = THREE.MathUtils.lerp(t.baseline[i], 0, smooth);
    }
  });
}
