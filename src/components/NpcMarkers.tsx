import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  CONVERSATION_POINTS,
  checkConversationProximity,
} from "../utils/conversations";
import { RobotNpc } from "./RobotNpc";

const ROBOT_CONVERSATION_ID = "robot-west";

function HologramMarker({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const innerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!innerRef.current) return;
    innerRef.current.position.y =
      position[1] + 6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.8;
    innerRef.current.rotation.y += 0.012;
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      <group ref={innerRef}>
        <mesh>
          <octahedronGeometry args={[3, 0]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} wireframe />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
        <pointLight color={color} intensity={8} distance={25} />
      </group>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 3.5, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function ProximityChecker({
  targetRef,
  dialogueActive,
  onNearby,
}: {
  targetRef: React.RefObject<{ position: THREE.Vector3 }>;
  dialogueActive: boolean;
  onNearby: (id: string | null) => void;
}) {
  const lastId = useRef<string | null>(null);

  useFrame(() => {
    if (dialogueActive || !targetRef.current) {
      if (lastId.current !== null) {
        lastId.current = null;
        onNearby(null);
      }
      return;
    }

    const { x, z } = targetRef.current.position;
    const id = checkConversationProximity(x, z, CONVERSATION_POINTS);

    if (id !== lastId.current) {
      lastId.current = id;
      onNearby(id);
    }
  });

  return null;
}

export function InteractionPrompt({
  targetRef,
  visible,
}: {
  targetRef: React.RefObject<{ position: THREE.Vector3 }>;
  visible: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !targetRef.current) return;
    const { x, y, z } = targetRef.current.position;
    groupRef.current.position.set(x, y + 6, z);
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      <Html center style={{ pointerEvents: "none" }}>
        <div
          style={{
            background: "rgba(0,0,0,0.78)",
            border: "1.5px solid rgba(0,255,255,0.55)",
            borderRadius: 8,
            padding: "8px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            whiteSpace: "nowrap",
            fontFamily: "'Segoe UI', 'Hiragino Sans', sans-serif",
            boxShadow: "0 0 14px rgba(0,255,255,0.15)",
          }}
        >
          <span
            style={{
              background: "#00ffff",
              color: "#000",
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 5,
              padding: "3px 10px",
              lineHeight: 1,
            }}
          >
            SPACE
          </span>
          <span style={{ color: "#ddd", fontSize: 15, fontWeight: 500 }}>話す</span>
        </div>
      </Html>
    </group>
  );
}

export function NpcMarkers({
  targetRef,
  dialogueActive,
  onNearby,
}: {
  targetRef: React.RefObject<{ position: THREE.Vector3 }>;
  dialogueActive: boolean;
  onNearby: (id: string | null) => void;
}) {
  return (
    <>
      {CONVERSATION_POINTS.map((cp) =>
        cp.id === ROBOT_CONVERSATION_ID ? (
          <RobotNpc key={cp.id} position={cp.position} color={cp.color} targetRef={targetRef} />
        ) : (
          <HologramMarker key={cp.id} position={cp.position} color={cp.color} />
        )
      )}
      <ProximityChecker
        targetRef={targetRef}
        dialogueActive={dialogueActive}
        onNearby={onNearby}
      />
    </>
  );
}
