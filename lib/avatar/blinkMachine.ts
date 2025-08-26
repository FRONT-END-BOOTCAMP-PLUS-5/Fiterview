import * as THREE from 'three';
import { BlinkIndices, BlinkState, BlinkParams } from '@/types/avatar';
import {
  CONTINUOUS_SLOW_BLINK,
  sampleBlinkParams,
  setBlinkAmountUnified,
} from '@/lib/avatar/blink';

type Ctx = {
  t: number;
  idleSeed: number;
  playing: boolean;
  mouth: number;
};

const DEBUG_BLINK = true;

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
    if (DEBUG_BLINK) console.debug('[Blink][CONTINUOUS] amt=', contAmt.toFixed(3));
    setBlinkAmountUnified(indices, contAmt);
    return;
  }

  // 대기 → 시작 트리거
  if (bs.phase === 0 && bs.tNow >= bs.tNext) {
    bs.params = sampleBlinkParams(ctx.playing, ctx.mouth);
    bs.phase = 1;
    bs.tNow = 0;
    (bs as any)._wallCloseStart = performance.now();
    if (DEBUG_BLINK) {
      const now = performance.now();
      (bs as any)._dbg = { closeStart: now };
      console.debug('[Blink][TRIGGER]', {
        nextInMs: Math.round(bs.tNext * 1000),
        params: bs.params,
        mouth: Number(ctx.mouth.toFixed(3)),
      });
    }
  }

  if (bs.phase === 1) {
    // 닫기
    const { closeDur, amp } = bs.params;
    const now = performance.now();
    const start = (bs as any)._wallCloseStart ?? now;
    (bs as any)._wallCloseStart = start;
    const p = THREE.MathUtils.clamp((now - start) / (closeDur * 1000), 0, 1);
    const amt = THREE.MathUtils.clamp(p * amp, 0, 1);
    setBlinkAmountUnified(indices, amt);
    if (amt >= amp) {
      bs.phase = 2;
      bs.tNow = 0;
      (bs as any)._wallHoldStart = performance.now();
      if (DEBUG_BLINK) {
        const dbg = (bs as any)._dbg || {};
        const closeMs = dbg.closeStart ? performance.now() - dbg.closeStart : NaN;
        dbg.holdStart = performance.now();
        (bs as any)._dbg = dbg;
        console.debug('[Blink][CLOSE→HOLD]', {
          closeMs: Math.round(closeMs),
          targetAmp: amp,
        });
      }
    }
  } else if (bs.phase === 2) {
    // 유지
    const { holdDur, amp } = bs.params;
    setBlinkAmountUnified(indices, amp);
    const now = performance.now();
    const holdStart = (bs as any)._wallHoldStart ?? now;
    (bs as any)._wallHoldStart = holdStart;
    if (now - holdStart >= holdDur * 1000) {
      bs.phase = 3;
      bs.tNow = 0;
      (bs as any)._wallOpenStart = performance.now();
      if (DEBUG_BLINK) {
        const dbg = (bs as any)._dbg || {};
        const holdMs = dbg.holdStart ? performance.now() - dbg.holdStart : NaN;
        dbg.openStart = performance.now();
        (bs as any)._dbg = dbg;
        console.debug('[Blink][HOLD→OPEN]', { holdMs: Math.round(holdMs) });
      }
    }
  } else if (bs.phase === 3) {
    // 열기
    const { openDur, amp, isDouble, secondQueued } = bs.params;
    const now = performance.now();
    const openStart = (bs as any)._wallOpenStart ?? now;
    (bs as any)._wallOpenStart = openStart;
    const p = THREE.MathUtils.clamp((now - openStart) / (openDur * 1000), 0, 1);
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
        if (DEBUG_BLINK) console.debug('[Blink][OPEN→DOUBLE]');
        (bs as any)._wallCloseStart = performance.now();
      } else {
        bs.phase = 0;
        bs.tNow = 0;
        // Shorter inter-blink interval
        const base = 0.04 + Math.random() * 0.08;
        const speakingDelay = ctx.playing && ctx.mouth > 0.2 ? 0.1 + Math.random() * 0.2 : 0;
        bs.tNext = base + speakingDelay;
        if (DEBUG_BLINK) {
          const dbg = (bs as any)._dbg || {};
          const openMs = dbg.openStart ? performance.now() - dbg.openStart : NaN;
          console.debug('[Blink][OPEN→WAIT]', {
            openMs: Math.round(openMs),
            nextMs: Math.round(bs.tNext * 1000),
          });
        }
        (bs as any)._wallCloseStart = undefined;
        (bs as any)._wallHoldStart = undefined;
        (bs as any)._wallOpenStart = undefined;
      }
    }
  }
}
