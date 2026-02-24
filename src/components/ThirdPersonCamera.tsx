import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { lerpAngle } from "../utils/character";

const CAMERA_DISTANCE = 40;
const CAMERA_HEIGHT = 20;
const DIALOGUE_DISTANCE = 10;
const DIALOGUE_HEIGHT = 4;
const POSITION_LERP = 2;
const DIALOGUE_LERP = 2.5;
const FORWARD_FOLLOW_SPEED = 1.5;
const IDLE_FOLLOW_SPEED = 0.8;
const FORWARD_THRESHOLD = 0.1;

export function ThirdPersonCamera({
  targetRef,
  enabled,
  dialogueActive = false,
  eventPosition,
}: {
  targetRef: React.RefObject<{
    position: THREE.Vector3;
    rotation: number;
    cameraYaw: number;
    velocity: THREE.Vector3;
  }>;
  enabled: boolean;
  dialogueActive?: boolean;
  eventPosition?: [number, number, number] | null;
}) {
  const { camera } = useThree();
  const cameraYaw = useRef(0);
  const idealPos = useRef(new THREE.Vector3());
  const lookAtPos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!enabled || !targetRef.current) return;

    const { position, rotation, velocity } = targetRef.current;

    if (dialogueActive && eventPosition) {
      // Position camera behind the character, looking toward the event
      const dx = eventPosition[0] - position.x;
      const dz = eventPosition[2] - position.z;
      const angleToEvent = Math.atan2(dx, dz);

      idealPos.current.set(
        position.x - Math.sin(angleToEvent) * DIALOGUE_DISTANCE,
        position.y + DIALOGUE_HEIGHT,
        position.z - Math.cos(angleToEvent) * DIALOGUE_DISTANCE
      );

      // Look at a point between character and event
      const midX = (position.x + eventPosition[0]) / 2;
      const midZ = (position.z + eventPosition[2]) / 2;
      const target = new THREE.Vector3(midX, eventPosition[1] + 2, midZ);

      const t = 1 - Math.exp(-DIALOGUE_LERP * delta);
      camera.position.lerp(idealPos.current, t);
      lookAtPos.current.lerp(target, t);
      camera.lookAt(lookAtPos.current);
      targetRef.current.cameraYaw = angleToEvent;
      return;
    }

    const camFwdX = Math.sin(cameraYaw.current);
    const camFwdZ = Math.cos(cameraYaw.current);
    const dot = velocity.x * camFwdX + velocity.z * camFwdZ;
    const speed = velocity.x * velocity.x + velocity.z * velocity.z;
    const isForward = dot > FORWARD_THRESHOLD;
    const isStopped = speed < 0.01;

    if (isForward) {
      cameraYaw.current = lerpAngle(
        cameraYaw.current,
        rotation,
        FORWARD_FOLLOW_SPEED * delta
      );
    } else if (isStopped) {
      cameraYaw.current = lerpAngle(
        cameraYaw.current,
        rotation,
        IDLE_FOLLOW_SPEED * delta
      );
    }

    idealPos.current.set(
      position.x - Math.sin(cameraYaw.current) * CAMERA_DISTANCE,
      position.y + CAMERA_HEIGHT,
      position.z - Math.cos(cameraYaw.current) * CAMERA_DISTANCE
    );

    const t = 1 - Math.exp(-POSITION_LERP * delta);
    camera.position.lerp(idealPos.current, t);

    lookAtPos.current.lerp(position, t);
    camera.lookAt(lookAtPos.current);

    targetRef.current.cameraYaw = cameraYaw.current;
  });

  return null;
}

export function DialogueCamera({
  targetRef,
  enabled,
  eventPosition,
}: {
  targetRef: React.RefObject<{
    position: THREE.Vector3;
    rotation: number;
  }>;
  enabled: boolean;
  eventPosition?: [number, number, number] | null;
}) {
  const { camera } = useThree();
  const idealPos = useRef(new THREE.Vector3());
  const lookAtPos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!enabled || !targetRef.current) return;

    const { position } = targetRef.current;
    const ep = eventPosition || [position.x, position.y, position.z];

    const dx = ep[0] - position.x;
    const dz = ep[2] - position.z;
    const angleToEvent = Math.atan2(dx, dz);

    idealPos.current.set(
      position.x - Math.sin(angleToEvent) * DIALOGUE_DISTANCE,
      position.y + DIALOGUE_HEIGHT,
      position.z - Math.cos(angleToEvent) * DIALOGUE_DISTANCE
    );

    const midX = (position.x + ep[0]) / 2;
    const midZ = (position.z + ep[2]) / 2;
    const target = new THREE.Vector3(midX, ep[1] + 2, midZ);

    const t = 1 - Math.exp(-DIALOGUE_LERP * delta);
    camera.position.lerp(idealPos.current, t);
    lookAtPos.current.lerp(target, t);
    camera.lookAt(lookAtPos.current);
  });

  return null;
}
