import { useMemo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";
import {
  BUILDINGS,
  LAMPS,
  NEON_COLORS,
  type BuildingData,
} from "../utils/cityLayout";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createTexturePool(rand: () => number) {
  const pool: THREE.CanvasTexture[] = [];
  const count = 12;

  for (let t = 0; t < count; t++) {
    const neonColor = NEON_COLORS[t % NEON_COLORS.length];
    const cw = 64;
    const ch = 128;
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, cw, ch);

    const cols = 4;
    const rows = 8;
    const winW = cw / cols;
    const winH = ch / rows;
    const padX = winW * 0.2;
    const padY = winH * 0.15;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = rand() > 0.3;
        if (lit) {
          ctx.fillStyle =
            rand() > 0.5
              ? neonColor
              : `rgba(180, 200, 255, ${0.3 + rand() * 0.7})`;
        } else {
          ctx.fillStyle = "#0f0f19";
        }
        ctx.fillRect(
          c * winW + padX,
          r * winH + padY,
          winW - padX * 2,
          winH - padY * 2
        );
      }
    }

    ctx.strokeStyle = neonColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(cw, 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    pool.push(texture);
  }

  return pool;
}

function Building({
  data,
  texture,
}: {
  data: BuildingData;
  texture: THREE.CanvasTexture;
}) {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[data.w / 2, data.h / 2, data.d / 2]}
        position={[data.x, data.h / 2, data.z]}
      />
      <mesh position={[data.x, data.h / 2, data.z]}>
        <boxGeometry args={[data.w, data.h, data.d]} />
        <meshBasicMaterial map={texture} color={data.neonColor} />
      </mesh>
    </RigidBody>
  );
}

function StreetLamp({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 7, 4]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0, 7.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

export function CityEnvironment() {
  const texPool = useMemo(() => {
    const rand = seededRandom(9999);
    return createTexturePool(rand);
  }, []);

  return (
    <>
      {BUILDINGS.map((b, i) => (
        <Building key={i} data={b} texture={texPool[b.texIndex]} />
      ))}
      {LAMPS.map((l, i) => (
        <StreetLamp key={`lamp-${i}`} x={l.x} z={l.z} color={l.color} />
      ))}
    </>
  );
}
