import { useEffect, useState } from "react";

export function useKeyboard() {
  const [keys, setKeys] = useState(new Set<string>());

  useEffect(() => {
    const onDown = (e: KeyboardEvent) =>
      setKeys((prev) => new Set(prev).add(e.code));
    const onUp = (e: KeyboardEvent) =>
      setKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return keys;
}
