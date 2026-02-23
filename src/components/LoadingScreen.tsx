import { useState, useEffect, useRef } from "react";
import { useProgress } from "@react-three/drei";

export function LoadingOverlay({
  label = "NOW LOADING",
  minDuration = 1200,
}: {
  label?: string;
  minDuration?: number;
}) {
  const { progress, active } = useProgress();
  const [phase, setPhase] = useState<"loading" | "fadeOut" | "hidden">(
    "loading"
  );
  const [minReached, setMinReached] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const loadStarted = useRef(false);

  if (active) loadStarted.current = true;

  // Minimum display time
  useEffect(() => {
    const timer = setTimeout(() => setMinReached(true), minDuration);
    return () => clearTimeout(timer);
  }, [minDuration]);

  // Transition to fade-out when min reached and loading done
  useEffect(() => {
    if (phase !== "loading" || !minReached) return;
    if (active) return;
    setPhase("fadeOut");
  }, [minReached, active, phase]);

  // Fade-out → hidden
  useEffect(() => {
    if (phase !== "fadeOut") return;
    const timer = setTimeout(() => setPhase("hidden"), 600);
    return () => clearTimeout(timer);
  }, [phase]);

  // Animate progress display
  useEffect(() => {
    if (phase === "fadeOut" || phase === "hidden") {
      setDisplayProgress(100);
      return;
    }

    if (active && progress > 0) {
      setDisplayProgress((prev) => Math.max(prev, progress));
      return;
    }

    // Smooth fake progress while waiting
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + (90 - prev) * 0.06;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [active, progress, phase]);

  if (phase === "hidden") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#080808",
        fontFamily: "'Segoe UI', 'Hiragino Sans', sans-serif",
        opacity: phase === "fadeOut" ? 0 : 1,
        transition: "opacity 0.6s ease-out",
        pointerEvents: phase === "fadeOut" ? "none" : "auto",
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(0,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* Center glow */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,180,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Label */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 6,
          color: "#555",
          marginBottom: 32,
          textTransform: "uppercase",
          position: "relative",
        }}
      >
        {label}
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 240,
          height: 2,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${displayProgress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #00ccff, #00ffff)",
            borderRadius: 1,
            transition: "width 0.25s ease-out",
            boxShadow: "0 0 8px rgba(0,255,255,0.3)",
          }}
        />
      </div>

      {/* Percentage */}
      <div
        style={{
          fontSize: 11,
          color: "#444",
          marginTop: 16,
          letterSpacing: 2,
          fontVariantNumeric: "tabular-nums",
          position: "relative",
        }}
      >
        {Math.round(displayProgress)}%
      </div>
    </div>
  );
}
