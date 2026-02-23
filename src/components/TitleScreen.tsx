import { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, Stats } from "@react-three/drei";
import * as THREE from "three";
import { setupShadows } from "../utils/character";
import { LoadingOverlay } from "./LoadingScreen";

const MODEL_URL = "/sentinel-draco.glb";

function TitleSentinel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL, true);
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => setupShadows(scene), [scene]);

  useEffect(() => {
    const actionName = Object.keys(actions)[0];
    if (actionName && actions[actionName]) {
      const action = actions[actionName]!;
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.timeScale = 0.4;
      action.play();
    }
  }, [actions]);

  return (
    <group ref={groupRef} position={[-0.5, -6, 2]} rotation={[0, -0, 0]}>
      <primitive object={scene} scale={5} />
    </group>
  );
}

const MENU_ITEMS = [
  {
    key: "park" as const,
    label: "Park",
    desc: "A peaceful stroll through green fields",
    accent: "#40ff40",
  },
  {
    key: "cyberpunk" as const,
    label: "Cyberpunk",
    desc: "Explore a neon-lit city at night",
    accent: "#00ffff",
  },
];

export function TitleScreen({
  onSelectMode,
}: {
  onSelectMode: (mode: "park" | "cyberpunk") => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        background: "#080808",
        fontFamily: "'Segoe UI', 'Hiragino Sans', sans-serif",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Bokeh glow effects */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,200,255,0.12) 0%, transparent 70%)",
          top: "40%",
          left: "45%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(64,255,64,0.08) 0%, transparent 70%)",
          top: "25%",
          left: "35%",
          pointerEvents: "none",
        }}
      />

      {/* Left side: Menu */}
      <div
        style={{
          flex: "0 0 45%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: "6%",
          position: "relative",
          zIndex: 2,
        }}
      >
        <h1
          style={{
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: 6,
            marginBottom: 6,
            color: "#fff",
          }}
        >
          Walking Demo
        </h1>
        <div
          style={{
            fontSize: 13,
            color: "#666",
            marginBottom: 56,
            letterSpacing: 2,
          }}
        >
          SELECT MODE
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {MENU_ITEMS.map((item) => {
            const isActive = hovered === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectMode(item.key)}
                onMouseEnter={() => setHovered(item.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "block",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  padding: "14px 0 14px 20px",
                  position: "relative",
                  transition: "all 0.2s",
                  borderLeft: isActive
                    ? `3px solid ${item.accent}`
                    : "3px solid transparent",
                }}
              >
                {/* Active highlight bar background */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(90deg, ${item.accent}22 0%, transparent 100%)`,
                      pointerEvents: "none",
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: isActive ? item.accent : "#ccc",
                    transition: "color 0.2s",
                    position: "relative",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: isActive ? "#999" : "#555",
                    marginTop: 4,
                    transition: "color 0.2s",
                    position: "relative",
                  }}
                >
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom hint */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "6%",
            fontSize: 12,
            color: "#444",
            letterSpacing: 1,
          }}
        >
          Tab: Switch Character　C: Camera　WASD: Move
        </div>
      </div>

      {/* Right side: 3D Sentinel model */}
      <div
        style={{
          flex: "0 0 55%",
          position: "relative",
        }}
      >
        {/* Dot grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(0,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Backlight glow */}
        <div
          style={{
            position: "absolute",
            width: "70%",
            height: "70%",
            top: "15%",
            left: "15%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,180,255,0.15) 0%, rgba(0,255,255,0.05) 40%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Geometric frame - outer ring */}
        <div
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "1px solid rgba(0,255,255,0.12)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Geometric frame - inner ring */}
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "1px solid rgba(0,255,255,0.07)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Geometric accent lines - horizontal */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "10%",
            right: "10%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.1) 30%, rgba(0,255,255,0.1) 70%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Geometric accent lines - vertical */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "10%",
            bottom: "10%",
            width: 1,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,255,255,0.08) 30%, rgba(0,255,255,0.08) 70%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Corner accents - top right */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 40,
            height: 40,
            borderTop: "2px solid rgba(0,255,255,0.2)",
            borderRight: "2px solid rgba(0,255,255,0.2)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Corner accents - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 40,
            height: 40,
            borderBottom: "2px solid rgba(0,255,255,0.2)",
            borderRight: "2px solid rgba(0,255,255,0.2)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Corner accents - bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            width: 40,
            height: 40,
            borderBottom: "2px solid rgba(0,255,255,0.15)",
            borderLeft: "2px solid rgba(0,255,255,0.15)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <Canvas
          camera={{ position: [0, 1, 10], fov: 40 }}
          style={{ background: "transparent", position: "relative", zIndex: 2 }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[3, 5, 5]}
            intensity={3}
            color="#ffffff"
          />
          <Suspense fallback={null}>
            <TitleSentinel />
          </Suspense>
          <Stats />
        </Canvas>
      </div>

      <LoadingOverlay label="LOADING" minDuration={1500} />
    </div>
  );
}
