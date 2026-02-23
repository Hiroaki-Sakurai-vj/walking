# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A 3D walking simulator built with React Three Fiber. Two playable characters (Bichon Frise dog and Sentinel warrior) explore either a peaceful park or a procedurally-generated cyberpunk city. The cyberpunk mode features NPC conversation points with branching dialogue that changes based on which character you're controlling. UI text is in Japanese.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check + Vite production build (`tsc -b && vite build`)
- `npm run lint` — ESLint across the project
- `npm run preview` — Preview production build locally

## Architecture

**Rendering stack:** React 19 + Three.js via `@react-three/fiber`, with `@react-three/drei` for helpers (OrbitControls, Environment, Sky, useGLTF, useAnimations, Html, Stats) and `@react-three/rapier` for physics (kinematic rigid bodies + cuboid colliders for ground and buildings).

**App flow:** `TitleScreen` (mode select) → `App` (main game loop). `App` manages all top-level state: active character, camera mode, dialogue state, and proximity detection. A shared `targetRef` (position, rotation, cameraYaw, velocity) is passed between character components and cameras as the coordination mechanism.

**Characters** (`BichonFrise`, `Sentinel`): Nearly identical structure — load a GLTF model with Draco compression, use `useKeyboard` hook for WASD/arrow input, apply movement via `useFrame`, and write to `targetRef` when active. Movement is camera-relative in third-person mode. Building collision is checked per-axis allowing wall sliding. Only the active character responds to input; the inactive one idles.

**Camera system** (`ThirdPersonCamera`, `DialogueCamera`): Both are renderless components using `useFrame` to lerp the camera. `ThirdPersonCamera` follows the active character with yaw tracking that adapts to movement direction. During dialogue, both camera components transition to a cinematic angle between character and event position.

**City generation** (`cityLayout.ts`): Seeded PRNG generates a 9x9 grid of building blocks with streets. `BUILDINGS` and `LAMPS` arrays are computed once at module load. `checkBuildingCollision` does per-axis AABB overlap for wall sliding. `CityEnvironment` renders buildings with procedural canvas textures (neon-lit windows). `Ground` renders a tiling road or grass texture depending on scene mode.

**Dialogue system** (`conversations.ts`, `DialogueBox`, `NpcMarkers`): `CONVERSATION_POINTS` defines NPC locations with branching dialogue trees per character. `NpcMarkers` renders hologram markers and runs proximity checks each frame. `DialogueBox` is an HTML overlay handling text display, choice selection (keyboard + mouse), and advancement. Dialogue freezes character movement and makes character models semi-transparent.

## Key Conventions

- GLB models live in `public/` and are loaded with `useGLTF` + Draco decompression (`useGLTF("/model-draco.glb", true)`)
- Ground textures and building facade textures are procedurally generated via Canvas2D at startup (no texture image files)
- TypeScript strict mode is enabled (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`)
- All styles are inline — no CSS modules or styled-components
- No state management library; state lives in `App` and flows via props/refs
