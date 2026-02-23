import { Environment, OrbitControls, Sky } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

const MODE_CONFIG = {
  park: {
    fogColor: "#c0d8f0",
    fogDensity: 0.0004,
    ambientIntensity: 0.4,
    directionalIntensity: 1.5,
    envPreset: "park" as const,
    envBackground: true,
    sunY: 60,
  },
  cyberpunk: {
    fogColor: "#c0d8f0",
    fogDensity: 0.003,
    ambientIntensity: 0.4,
    directionalIntensity: 1.5,
    envPreset: "park" as const,
    envBackground: false,
    sunY: 60,
  },
};

export function Scene({
  cameraMode = "orbit",
  sceneMode = "cyberpunk",
  dialogueActive = false,
}: {
  cameraMode?: string;
  sceneMode?: "park" | "cyberpunk";
  dialogueActive?: boolean;
}) {
  const { scene } = useThree();
  const cfg = MODE_CONFIG[sceneMode];

  useEffect(() => {
    scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fogDensity);
    if (!cfg.envBackground) {
      scene.background = new THREE.Color(cfg.fogColor);
    }
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene, cfg.fogColor, cfg.fogDensity, cfg.envBackground]);

  return (
    <>
      <ambientLight intensity={cfg.ambientIntensity} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={cfg.directionalIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <Environment preset={cfg.envPreset} background={cfg.envBackground} />
      {sceneMode === "cyberpunk" && (
        <Sky
          sunPosition={[100, cfg.sunY, 50]}
          turbidity={8}
          rayleigh={2}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      )}
      {cameraMode === "orbit" && !dialogueActive && <OrbitControls makeDefault />}
    </>
  );
}
