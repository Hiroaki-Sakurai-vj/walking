import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import { Stats } from "@react-three/drei";
import { Scene } from "./components/Scene";
import { Ground } from "./components/Ground";
import { BichonFrise } from "./components/BichonFrise";
import { Sentinel } from "./components/Sentinel";
import { ThirdPersonCamera, DialogueCamera } from "./components/ThirdPersonCamera";
import { CityEnvironment } from "./components/CityEnvironment";
import { NpcMarkers, InteractionPrompt } from "./components/NpcMarkers";
import { DialogueBox } from "./components/DialogueBox";
import { TitleScreen } from "./components/TitleScreen";
import { LoadingOverlay } from "./components/LoadingScreen";
import { CONVERSATION_POINTS } from "./utils/conversations";

type Character = "bichon" | "sentinel";
type CameraMode = "orbit" | "thirdPerson";
type SceneMode = "park" | "cyberpunk";

const LABELS: Record<Character, string> = {
  bichon: "Bichon Frise",
  sentinel: "Sentinel",
};

const CAMERA_LABELS: Record<CameraMode, string> = {
  orbit: "自由",
  thirdPerson: "追従",
};

export default function App() {
  const [sceneMode, setSceneMode] = useState<SceneMode | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<Character>("bichon");
  const [cameraMode, setCameraMode] = useState<CameraMode>("orbit");
  const targetRef = useRef({
    position: new THREE.Vector3(),
    rotation: 0,
    cameraYaw: 0,
    velocity: new THREE.Vector3(),
  });

  // Proximity state
  const [nearbyConversation, setNearbyConversation] = useState<string | null>(null);

  // Dialogue state
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [dialogueLineIndex, setDialogueLineIndex] = useState(0);
  const [choiceResponse, setChoiceResponse] = useState<{ speaker: string; text: string } | null>(null);

  const dialogueActive = activeConversation !== null;
  const currentConversation = dialogueActive
    ? CONVERSATION_POINTS.find((cp) => cp.id === activeConversation) ?? null
    : null;
  const currentNodes = currentConversation
    ? currentConversation.dialogue[activeCharacter]
    : null;
  const currentNode = currentNodes
    ? currentNodes[dialogueLineIndex] ?? null
    : null;

  const startDialogue = useCallback((id: string) => {
    setActiveConversation(id);
    setDialogueLineIndex(0);
    setChoiceResponse(null);
  }, []);

  const handleAdvanceDialogue = useCallback(() => {
    if (!currentNodes) return;

    if (choiceResponse) {
      setChoiceResponse(null);
      if (dialogueLineIndex < currentNodes.length - 1) {
        setDialogueLineIndex((i) => i + 1);
      } else {
        setActiveConversation(null);
        setDialogueLineIndex(0);
      }
      return;
    }

    if (dialogueLineIndex < currentNodes.length - 1) {
      setDialogueLineIndex((i) => i + 1);
    } else {
      setActiveConversation(null);
      setDialogueLineIndex(0);
    }
  }, [activeConversation, currentNodes, dialogueLineIndex, choiceResponse]);

  const handleChoice = useCallback((index: number) => {
    if (!currentNode?.choices) return;
    const choice = currentNode.choices[index];
    if (choice) {
      setChoiceResponse(choice.response);
    }
  }, [currentNode]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (dialogueActive) return;
      if (e.code === "Space" && nearbyConversation) {
        e.preventDefault();
        startDialogue(nearbyConversation);
        return;
      }
      if (e.code === "Tab") {
        e.preventDefault();
        setActiveCharacter((prev) =>
          prev === "bichon" ? "sentinel" : "bichon"
        );
      }
      if (e.code === "KeyC") {
        setCameraMode((prev) =>
          prev === "orbit" ? "thirdPerson" : "orbit"
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialogueActive, nearbyConversation, startDialogue]);

  if (sceneMode === null) {
    return <TitleScreen onSelectMode={setSceneMode} />;
  }

  const eventPosition = currentConversation?.position ?? null;

  // Determine what to show in the dialogue box
  const showDialogue = dialogueActive && (currentNode || choiceResponse);
  const displaySpeaker = choiceResponse ? choiceResponse.speaker : currentNode?.speaker ?? "";
  const displayText = choiceResponse ? choiceResponse.text : currentNode?.text ?? "";
  const displayChoices = !choiceResponse && currentNode?.choices ? currentNode.choices : undefined;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 10,
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={() =>
            setActiveCharacter((prev) =>
              prev === "bichon" ? "sentinel" : "bichon"
            )
          }
          style={{
            padding: "8px 16px",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          操作中: {LABELS[activeCharacter]}
        </button>
        <button
          onClick={() =>
            setCameraMode((prev) =>
              prev === "orbit" ? "thirdPerson" : "orbit"
            )
          }
          style={{
            padding: "8px 16px",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          カメラ: {CAMERA_LABELS[cameraMode]}
        </button>
      </div>
      <Canvas
        shadows
        camera={{ position: [30, 8, 50], fov: 50 }}
      >
        <Physics gravity={[0, -9.81, 0]}>
          <Suspense fallback={null}>
            <Scene cameraMode={cameraMode} sceneMode={sceneMode} dialogueActive={dialogueActive} />
            <Ground sceneMode={sceneMode} />
            {sceneMode === "cyberpunk" && <CityEnvironment />}
            {sceneMode === "cyberpunk" && (
              <NpcMarkers
                targetRef={targetRef}
                dialogueActive={dialogueActive}
                onNearby={setNearbyConversation}
              />
            )}
            <BichonFrise
              active={activeCharacter === "bichon"}
              targetRef={targetRef}
              cameraMode={cameraMode}
              sceneMode={sceneMode}
              dialogueActive={dialogueActive}
            />
            <Sentinel
              position={[5, 0, 0]}
              active={activeCharacter === "sentinel"}
              targetRef={targetRef}
              cameraMode={cameraMode}
              sceneMode={sceneMode}
              dialogueActive={dialogueActive}
            />
            <InteractionPrompt
              targetRef={targetRef}
              visible={nearbyConversation !== null && !dialogueActive}
            />
          </Suspense>
        </Physics>
        <ThirdPersonCamera
          targetRef={targetRef}
          enabled={cameraMode === "thirdPerson"}
          dialogueActive={dialogueActive}
          eventPosition={eventPosition}
        />
        <DialogueCamera
          targetRef={targetRef}
          enabled={cameraMode === "orbit" && dialogueActive}
          eventPosition={eventPosition}
        />
        <Stats />
      </Canvas>
      <LoadingOverlay key={sceneMode} label="NOW LOADING" minDuration={1500} />
      {showDialogue && (
        <DialogueBox
          speakerName={displaySpeaker}
          text={displayText}
          accentColor={currentConversation!.color}
          choices={displayChoices}
          onAdvance={handleAdvanceDialogue}
          onChoice={handleChoice}
        />
      )}
    </>
  );
}
