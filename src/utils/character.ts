import * as THREE from "three";

export const ROTATION_SPEED = 10;

export function getDirectionFromKeys(
  keys: Set<string>,
  cameraYaw?: number
): THREE.Vector3 {
  const dir = new THREE.Vector3();
  if (keys.has("KeyW") || keys.has("ArrowUp")) dir.z -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) dir.z += 1;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) dir.x -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) dir.x += 1;

  if (cameraYaw !== undefined && (dir.x !== 0 || dir.z !== 0)) {
    const cos = Math.cos(cameraYaw);
    const sin = Math.sin(cameraYaw);
    const rx = -dir.x * cos - dir.z * sin;
    const rz = dir.x * sin - dir.z * cos;
    dir.x = rx;
    dir.z = rz;
  }

  return dir;
}

export function lerpAngle(current: number, target: number, t: number): number {
  let diff = target - current;
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * Math.min(1, t);
}

export function setupShadows(scene: THREE.Object3D) {
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      const mat = (child as THREE.Mesh)
        .material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.transparent = false;
        mat.depthWrite = true;
        mat.alphaTest = 0.5;
      }
    }
  });
}
