import { useState, useEffect, useCallback } from "react";
import type { DialogueChoice } from "../utils/conversations";

export function DialogueBox({
  speakerName,
  text,
  accentColor,
  choices,
  onAdvance,
  onChoice,
}: {
  speakerName: string;
  text: string;
  accentColor: string;
  choices?: DialogueChoice[];
  onAdvance: () => void;
  onChoice?: (index: number) => void;
}) {
  const [showIndicator, setShowIndicator] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasChoices = choices && choices.length > 0;

  // Reset selection when choices change
  useEffect(() => {
    setSelectedIndex(0);
  }, [choices]);

  useEffect(() => {
    const interval = setInterval(() => setShowIndicator((v) => !v), 600);
    return () => clearInterval(interval);
  }, []);

  const handleAdvance = useCallback(() => {
    if (!hasChoices) onAdvance();
  }, [onAdvance, hasChoices]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (hasChoices) {
        if (e.code === "ArrowUp" || e.code === "KeyW") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          return;
        }
        if (e.code === "ArrowDown" || e.code === "KeyS") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(choices!.length - 1, prev + 1));
          return;
        }
        if (e.code === "Enter" || e.code === "Space") {
          e.preventDefault();
          onChoice?.(selectedIndex);
          return;
        }
        if (e.code === "Digit1" && onChoice) {
          e.preventDefault();
          onChoice(0);
        }
        if (e.code === "Digit2" && choices!.length > 1 && onChoice) {
          e.preventDefault();
          onChoice(1);
        }
        return;
      }
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        onAdvance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onAdvance, onChoice, hasChoices, choices, selectedIndex]);

  return (
    <div
      onClick={handleAdvance}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        pointerEvents: "auto",
        cursor: hasChoices ? "default" : "pointer",
      }}
    >
      <div
        style={{
          width: "80%",
          maxWidth: 700,
          marginBottom: 32,
          padding: "20px 28px",
          background: "rgba(8, 8, 16, 0.92)",
          border: `1px solid ${accentColor}44`,
          borderLeft: `3px solid ${accentColor}`,
          borderRadius: 4,
          fontFamily: "'Segoe UI', 'Hiragino Sans', sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: 2,
            marginBottom: 8,
            textTransform: "uppercase" as const,
          }}
        >
          {speakerName}
        </div>
        <div
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: "#e0e0e0",
          }}
        >
          {text}
        </div>

        {hasChoices ? (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {choices!.map((c, i) => {
              const isSelected = i === selectedIndex;
              return (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChoice?.(i);
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  style={{
                    background: isSelected ? `${accentColor}18` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isSelected ? accentColor : `${accentColor}44`}`,
                    borderRadius: 4,
                    padding: "10px 16px",
                    color: "#e0e0e0",
                    fontSize: 15,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  <span style={{ color: accentColor, marginRight: 8, fontSize: 13 }}>
                    {isSelected ? "▸" : `${i + 1}.`}
                  </span>
                  {c.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              fontSize: 12,
              color: "#666",
              textAlign: "right" as const,
              marginTop: 12,
              letterSpacing: 1,
              opacity: showIndicator ? 1 : 0,
              transition: "opacity 0.15s",
            }}
          >
            {">>>"}
          </div>
        )}
      </div>
    </div>
  );
}
