import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/robot-draco.glb";
const MODEL_SCALE = 12;
const TURN_SPEED = 3;

export function RobotNpc({
  position,
  color,
  targetRef,
}: {
  position: [number, number, number];
  color: string;
  targetRef?: React.RefObject<{ position: THREE.Vector3 }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const rotationRef = useRef(0);
  const { scene } = useGLTF(MODEL_URL, true);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      position[1] + 2 + Math.sin(state.clock.elapsedTime * 1.2) * 0.4;

    if (targetRef?.current) {
      const dx = targetRef.current.position.x - position[0];
      const dz = targetRef.current.position.z - position[2];
      const targetAngle = Math.atan2(dx, dz);
      let diff = targetAngle - rotationRef.current;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      rotationRef.current += diff * Math.min(1, TURN_SPEED * delta);
      groupRef.current.rotation.y = rotationRef.current;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      <group ref={groupRef} scale={MODEL_SCALE}>
        <primitive object={scene} />
      </group>
      {/* Ground ring marker */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 3.5, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight
        position={[0, 4, 0]}
        color={color}
        intensity={8}
        distance={25}
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL, true);
