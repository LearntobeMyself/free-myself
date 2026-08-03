"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CharacterDock = dynamic(
  () =>
    import("@/components/live2d/character-dock").then((m) => m.CharacterDock),
  { ssr: false },
);

/** Defer Live2D dock until the browser is idle so page chrome paints first. */
export function CharacterDockLazy() {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const enable = () => setMount(true);

    // Wait for first paint + a beat so nav/buttons hydrate without Live2D contention.
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 1200 });
    } else {
      timeoutId = setTimeout(enable, 400);
    }

    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (!mount) return null;
  return <CharacterDock />;
}
