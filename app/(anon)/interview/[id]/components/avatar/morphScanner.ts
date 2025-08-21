import { BlinkIndices, Target } from './types';

//모프 스캔(뼈 찾기 + 모프 타겟 찾기)
export function scanMorphs(
  root: any,
  onBones: (bones: { jaw: any; head: any; neck: any; spine: any }) => void
): { targets: Target[]; indices: BlinkIndices; seen: Set<string> } {
  const indices: BlinkIndices = { eyes: [], openers: [] };
  const found: Target[] = [];
  const seen = new Set<string>();
  const candidateBoth: Array<{ t: Target; i: number }> = [];

  let jaw: any = null;
  let head: any = null;
  let neck: any = null;
  let spine: any = null;

  const normalize = (s: string) => s.toLowerCase().replace(/[\s_\-]/g, '');
  const exactBlink = new Set(['eyeBlinkLeft', 'eyeBlinkRight']);
  const exactOpen = new Set(['eyeWideLeft', 'eyeWideRight']);

  (root as any).traverse((obj: any) => {
    if (obj.isBone) {
      if (!jaw && /(^|_)jaw/i.test(obj.name)) jaw = obj;
      if (!head && /head/i.test(obj.name)) head = obj;
      if (!neck && /neck/i.test(obj.name)) neck = obj;
      if (!spine && /spine/i.test(obj.name)) spine = obj;
    }
    if (obj.morphTargetDictionary && obj.morphTargetInfluences) {
      const mesh = obj as any;
      const dict = mesh.morphTargetDictionary as Record<string, number>;
      const infl = mesh.morphTargetInfluences as number[];
      const target: Target = {
        mesh,
        dict,
        infl,
        baseline: new Float32Array(infl),
        controlIdx: [],
      };
      Object.entries(dict).forEach(([key, idx]) => {
        seen.add(key);
        const nk = normalize(key);
        if (exactBlink.has(key)) {
          indices.eyes.push({ t: target, i: idx });
        } else if (/(blink|eyesclosed|eyeclose|eyelidclose)/.test(nk)) {
          candidateBoth.push({ t: target, i: idx });
        } else if (
          exactOpen.has(key) ||
          /(eyeopen|eyewide|lidup|upperlid(up|raise)?|openeye|eyeup)/.test(nk)
        ) {
          indices.openers.push({ t: target, i: idx });
        }
      });
      found.push(target);
    }
  });

  if (indices.eyes.length === 0) {
    candidateBoth.forEach((c) => indices.eyes.push(c));
  }

  onBones({ jaw, head, neck, spine });
  return { targets: found, indices, seen };
}
