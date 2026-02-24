function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const NEON_COLORS = [
  "#00ffff",
  "#ff00ff",
  "#ff2080",
  "#40ff40",
  "#ffaa00",
  "#8040ff",
  "#00ff80",
];

export interface BuildingData {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  neonColor: string;
  texIndex: number;
}

export interface LampData {
  x: number;
  z: number;
  color: string;
}

export const BLOCK_SIZE = 40;
export const STREET_WIDTH = 20;
export const STEP = BLOCK_SIZE + STREET_WIDTH;

function generateCity(rand: () => number) {
  const buildings: BuildingData[] = [];
  const lamps: LampData[] = [];

  for (let gx = -4; gx <= 4; gx++) {
    for (let gz = -4; gz <= 4; gz++) {
      if (Math.abs(gx) <= 0 && Math.abs(gz) <= 0) continue;

      const cx = gx * STEP;
      const cz = gz * STEP;

      const count = 1 + Math.floor(rand() * 2);
      for (let i = 0; i < count; i++) {
        const w = 12 + rand() * 20;
        const d = 12 + rand() * 20;
        const h = 20 + rand() * 80;
        const ox = (rand() - 0.5) * (BLOCK_SIZE - w) * 0.8;
        const oz = (rand() - 0.5) * (BLOCK_SIZE - d) * 0.8;
        const neonColor = NEON_COLORS[Math.floor(rand() * NEON_COLORS.length)];
        const texIndex = Math.floor(rand() * 12);

        buildings.push({
          x: cx + ox,
          z: cz + oz,
          w,
          d,
          h,
          neonColor,
          texIndex,
        });
      }

      if (Math.abs(gz) === 0 && Math.abs(gx) <= 2) {
        const lampColor = NEON_COLORS[Math.floor(rand() * NEON_COLORS.length)];
        lamps.push({ x: cx + BLOCK_SIZE / 2 + 3, z: cz, color: lampColor });
      } else {
        rand();
      }
    }
  }

  return { buildings, lamps };
}

// Generate once, reuse everywhere
const rand = seededRandom(42);
const city = generateCity(rand);

export const BUILDINGS = city.buildings;
export const LAMPS = city.lamps;

/** Simple circular obstacles (e.g. NPCs) */
interface CircleObstacle {
  x: number;
  z: number;
  radius: number;
}

const CIRCLE_OBSTACLES: CircleObstacle[] = [
  { x: -30, z: 0, radius: 3 }, // Robot NPC
];

/**
 * Check if a circle at (x, z) with given radius overlaps any building or obstacle.
 */
export function checkBuildingCollision(
  x: number,
  z: number,
  radius: number
): { x: boolean; z: boolean } {
  let blockedX = false;
  let blockedZ = false;

  for (const b of BUILDINGS) {
    const margin = 1.0;
    const halfW = b.w / 2 + margin;
    const halfD = b.d / 2 + margin;
    const minX = b.x - halfW;
    const maxX = b.x + halfW;
    const minZ = b.z - halfD;
    const maxZ = b.z + halfD;

    const overlapX = x + radius > minX && x - radius < maxX;
    const overlapZ = z + radius > minZ && z - radius < maxZ;

    if (overlapX && overlapZ) {
      const penLeft = x + radius - minX;
      const penRight = maxX - (x - radius);
      const penTop = z + radius - minZ;
      const penBottom = maxZ - (z - radius);
      const minPenX = Math.min(penLeft, penRight);
      const minPenZ = Math.min(penTop, penBottom);

      if (minPenX < minPenZ) {
        blockedX = true;
      } else {
        blockedZ = true;
      }
    }
  }

  // Circle-vs-circle collision for NPC obstacles
  for (const ob of CIRCLE_OBSTACLES) {
    const dx = x - ob.x;
    const dz = z - ob.z;
    const minDist = radius + ob.radius;
    if (dx * dx + dz * dz < minDist * minDist) {
      if (Math.abs(dx) > Math.abs(dz)) {
        blockedX = true;
      } else {
        blockedZ = true;
      }
    }
  }

  return { x: blockedX, z: blockedZ };
}
