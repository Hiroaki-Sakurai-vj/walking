import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useKeyboard } from "../hooks/useKeyboard";
import {
  ROTATION_SPEED,
  getDirectionFromKeys,
  lerpAngle,
  setupShadows,
} from "../utils/character";
import { checkBuildingCollision } from "../utils/cityLayout";

const MODEL_URL = "/sentinel-draco.glb";
const WALK_SPEED = 11;
const MODEL_SCALE = 9;

export function Sentinel({
  position = [5, 0, -3] as [number, number, number],
  active = false,
  targetRef,
  cameraMode = "orbit",
  sceneMode = "cyberpunk",
  dialogueActive = false,
}: {
  position?: [number, number, number];
  active?: boolean;
  targetRef?: React.RefObject<{
    position: THREE.Vector3;
    rotation: number;
    cameraYaw: number;
    velocity: THREE.Vector3;
  }>;
  cameraMode?: string;
  sceneMode?: "park" | "cyberpunk";
  dialogueActive?: boolean;
}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const groupRef = useRef<THREE.Group>(null);
  const positionRef = useRef(new THREE.Vector3(...position));
  const rotationRef = useRef(0);
  const keys = useKeyboard();

  const { scene, animations } = useGLTF(MODEL_URL, true);
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => setupShadows(scene), [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of materials) {
          mat.transparent = true;
          mat.opacity = dialogueActive ? 0.3 : 1;
        }
      }
    });
  }, [scene, dialogueActive]);

  useEffect(() => {
    const actionName = Object.keys(actions)[0];
    if (actionName && actions[actionName]) {
      const action = actions[actionName]!;
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }
  }, [actions]);

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;

    const cameraYaw =
      cameraMode === "thirdPerson" ? targetRef?.current?.cameraYaw : undefined;
    const dir = active && !dialogueActive
      ? getDirectionFromKeys(keys, cameraYaw)
      : new THREE.Vector3();
    const moving = dir.length() > 0;

    if (moving) {
      dir.normalize();

      // Dot product of movement direction with camera forward to detect backward
      const isBackward =
        cameraYaw !== undefined &&
        dir.x * Math.sin(cameraYaw) + dir.z * Math.cos(cameraYaw) < -0.1;

      if (isBackward) {
        // Face the camera while walking backward
        rotationRef.current = lerpAngle(
          rotationRef.current,
          cameraYaw + Math.PI,
          ROTATION_SPEED * delta
        );
      } else {
        rotationRef.current = lerpAngle(
          rotationRef.current,
          Math.atan2(dir.x, dir.z),
          ROTATION_SPEED * delta
        );
      }

      const newX = positionRef.current.x + dir.x * WALK_SPEED * delta;
      const newZ = positionRef.current.z + dir.z * WALK_SPEED * delta;
      const blocked = sceneMode === "cyberpunk"
        ? checkBuildingCollision(newX, newZ, 0.5)
        : { x: false, z: false };
      if (!blocked.x) positionRef.current.x = newX;
      if (!blocked.z) positionRef.current.z = newZ;
    }

    const actionName = Object.keys(actions)[0];
    if (actionName && actions[actionName]) {
      actions[actionName]!.paused = !moving;
    }

    rigidBodyRef.current.setNextKinematicTranslation({
      x: positionRef.current.x,
      y: positionRef.current.y,
      z: positionRef.current.z,
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = rotationRef.current;
    }

    if (active && targetRef?.current) {
      targetRef.current.position.copy(positionRef.current);
      targetRef.current.rotation = rotationRef.current;
      targetRef.current.velocity.set(
        moving ? dir.x * WALK_SPEED : 0,
        0,
        moving ? dir.z * WALK_SPEED : 0
      );
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      colliders={false}
      position={position}
    >
      <group ref={groupRef}>
        <primitive object={scene} scale={MODEL_SCALE} />
      </group>
    </RigidBody>
  );
}

useGLTF.preload(MODEL_URL, true);
