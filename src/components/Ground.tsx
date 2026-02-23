import { useMemo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";

// Must match CityEnvironment layout
const BLOCK_SIZE = 40;
const STREET_WIDTH = 20;
const STEP = BLOCK_SIZE + STREET_WIDTH; // 60
const GRID_COUNT = 9; // -4 to 4
const GROUND_SIZE = STEP * GRID_COUNT; // 540

function createGrassTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base green
  ctx.fillStyle = "#2d5a1e";
  ctx.fillRect(0, 0, size, size);

  // Grass variation stippling
  const grassColors = ["#3a6e28", "#245216", "#1e4812", "#4a8034", "#2a5e1a"];
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = grassColors[Math.floor(Math.random() * grassColors.length)];
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(GRID_COUNT * 2, GRID_COUNT * 2);
  return texture;
}

function createRoadTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Each texture tile = one step (block + road)
  // Road is split: half on each edge of the tile
  const roadHalf = (STREET_WIDTH / STEP) * size * 0.5; // road half-width in px
  const blockStart = roadHalf;
  const blockEnd = size - roadHalf;

  // Road base (dark asphalt)
  ctx.fillStyle = "#0c0c14";
  ctx.fillRect(0, 0, size, size);

  // Block area (slightly different dark - sidewalk)
  ctx.fillStyle = "#0a0a10";
  ctx.fillRect(blockStart, blockStart, blockEnd - blockStart, blockEnd - blockStart);

  // Sidewalk edge glow
  ctx.strokeStyle = "#0a2030";
  ctx.lineWidth = 2;
  ctx.strokeRect(blockStart, blockStart, blockEnd - blockStart, blockEnd - blockStart);

  // Road surface noise
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    // Only on road areas
    const onBlock = x > blockStart && x < blockEnd && y > blockStart && y < blockEnd;
    if (onBlock) continue;
    const v = 12 + Math.floor(Math.random() * 10);
    ctx.fillStyle = `rgb(${v}, ${v}, ${v + 4})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Center lane lines (neon cyan)
  const roadCenterV = size / 2;
  const roadCenterH = size / 2;

  // Vertical road center line (only in road areas: top road strip and bottom road strip)
  ctx.strokeStyle = "#00aacc";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 8]);
  // Top road strip
  ctx.beginPath();
  ctx.moveTo(roadCenterH, 0);
  ctx.lineTo(roadCenterH, blockStart);
  ctx.stroke();
  // Bottom road strip
  ctx.beginPath();
  ctx.moveTo(roadCenterH, blockEnd);
  ctx.lineTo(roadCenterH, size);
  ctx.stroke();

  // Horizontal road center line
  ctx.beginPath();
  ctx.moveTo(0, roadCenterV);
  ctx.lineTo(blockStart, roadCenterV);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(blockEnd, roadCenterV);
  ctx.lineTo(size, roadCenterV);
  ctx.stroke();
  ctx.setLineDash([]);

  // Intersection: cross lines at corners (where roads cross)
  ctx.strokeStyle = "#006680";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  // Top-left corner intersection
  ctx.beginPath();
  ctx.moveTo(0, roadHalf);
  ctx.lineTo(blockStart, roadHalf);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(roadHalf, 0);
  ctx.lineTo(roadHalf, blockStart);
  ctx.stroke();
  ctx.setLineDash([]);

  // Edge lane markings (dim neon)
  ctx.strokeStyle = "#003344";
  ctx.lineWidth = 1;
  // Along block edges
  ctx.setLineDash([6, 10]);
  const laneOffset = roadHalf * 0.5;
  // Top road
  ctx.beginPath();
  ctx.moveTo(blockStart, laneOffset);
  ctx.lineTo(blockEnd, laneOffset);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(blockStart, blockStart - laneOffset);
  ctx.lineTo(blockEnd, blockStart - laneOffset);
  ctx.stroke();
  // Bottom road
  ctx.beginPath();
  ctx.moveTo(blockStart, blockEnd + laneOffset);
  ctx.lineTo(blockEnd, blockEnd + laneOffset);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(blockStart, size - laneOffset);
  ctx.lineTo(blockEnd, size - laneOffset);
  ctx.stroke();
  // Left road
  ctx.beginPath();
  ctx.moveTo(laneOffset, blockStart);
  ctx.lineTo(laneOffset, blockEnd);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(blockStart - laneOffset, blockStart);
  ctx.lineTo(blockStart - laneOffset, blockEnd);
  ctx.stroke();
  // Right road
  ctx.beginPath();
  ctx.moveTo(blockEnd + laneOffset, blockStart);
  ctx.lineTo(blockEnd + laneOffset, blockEnd);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size - laneOffset, blockStart);
  ctx.lineTo(size - laneOffset, blockEnd);
  ctx.stroke();
  ctx.setLineDash([]);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(GRID_COUNT, GRID_COUNT);
  return texture;
}

export function Ground({ sceneMode = "cyberpunk" }: { sceneMode?: "park" | "cyberpunk" }) {
  const roadMap = useMemo(() => createRoadTexture(), []);
  const grassMap = useMemo(() => createGrassTexture(), []);
  const map = sceneMode === "park" ? grassMap : roadMap;

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[GROUND_SIZE / 2, 0.1, GROUND_SIZE / 2]}
        position={[0, -0.1, 0]}
      />
      <mesh
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        {sceneMode === "park" ? (
          <meshStandardMaterial map={map} />
        ) : (
          <meshBasicMaterial map={map} />
        )}
      </mesh>
    </RigidBody>
  );
}
