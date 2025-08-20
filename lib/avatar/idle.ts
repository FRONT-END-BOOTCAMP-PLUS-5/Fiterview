import * as THREE from 'three';

//아이들 모션 적용(고개 + 몸통 흔들림)
export function applyIdleMotion(
  head: THREE.Object3D | null,
  spine: THREE.Object3D | null,
  t: number,
  idleSeed: number
): void {
  const nod = Math.sin(t * 1.1 + idleSeed) * THREE.MathUtils.degToRad(1.2);
  const tilt = Math.sin(t * 0.8 + 1.7 + idleSeed) * THREE.MathUtils.degToRad(0.8);
  if (head) {
    head.rotation.x = (head.rotation.x || 0) * 0.9 + nod * 0.1;
    head.rotation.z = (head.rotation.z || 0) * 0.9 + tilt * 0.1;
  }
  if (spine) {
    const sway = Math.sin(t * 0.6 + 0.5 + idleSeed) * THREE.MathUtils.degToRad(0.6);
    spine.rotation.y = (spine.rotation.y || 0) * 0.9 + sway * 0.1;
    spine.position.z = (spine.position.z || 0) * 0.9 + Math.sin(t * 0.7) * 0.002;
  }
}
