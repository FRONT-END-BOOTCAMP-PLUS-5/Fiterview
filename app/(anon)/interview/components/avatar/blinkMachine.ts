import * as THREE from 'three';
import { BlinkIndices, BlinkState, BlinkParams } from './types';
import { CONTINUOUS_SLOW_BLINK, sampleBlinkParams, setBlinkAmountUnified } from './blink';

type Ctx = {
  t: number;
  idleSeed: number;
  playing: boolean;
  mouth: number;
};

//깜빡임 상태 업데이트 로직
export function advanceBlink(bs: BlinkState, dt: number, indices: BlinkIndices, ctx: Ctx): void {
  // 시간 진행
  bs.tNow += dt;

  // 연속 느린 깜빡 디버그 모드
  if (CONTINUOUS_SLOW_BLINK) {
    const phase = 0.5 + 0.5 * Math.sin(ctx.t * 10.5 + ctx.idleSeed);
    const minAmt = 0.05;
    const maxAmt = 0.95;
    const contAmt = minAmt + (maxAmt - minAmt) * phase;
    setBlinkAmountUnified(indices, contAmt);
    return;
  }

  // 대기 → 시작 트리거
  if (bs.phase === 0 && bs.tNow >= bs.tNext) {
    bs.params = sampleBlinkParams(ctx.playing, ctx.mouth);
    bs.phase = 1;
    bs.tNow = 0;
  }

  if (bs.phase === 1) {
    // 닫기
    const { closeDur, amp } = bs.params;
    const p = THREE.MathUtils.clamp(bs.tNow / closeDur, 0, 1);
    const amt = THREE.MathUtils.clamp(p * amp, 0, 1);
    setBlinkAmountUnified(indices, amt);
    if (amt >= amp) {
      bs.phase = 2;
      bs.tNow = 0;
    }
  } else if (bs.phase === 2) {
    // 유지
    const { holdDur, amp } = bs.params;
    setBlinkAmountUnified(indices, amp);
    if (bs.tNow >= holdDur) {
      bs.phase = 3;
      bs.tNow = 0;
    }
  } else if (bs.phase === 3) {
    // 열기
    const { openDur, amp, isDouble, secondQueued } = bs.params;
    const p = THREE.MathUtils.clamp(bs.tNow / openDur, 0, 1);
    const amt = Math.max(0, amp * (1 - p));
    setBlinkAmountUnified(indices, amt);
    if (amt <= 0.001) {
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
        const base = 0.08 + Math.random() * 0.4;
        const speakingDelay = ctx.playing && ctx.mouth > 0.2 ? 0.1 + Math.random() * 0.2 : 0;
        bs.tNext = base + speakingDelay;
      }
    }
  }
}
