"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Live2DStage } from "@/components/live2d/live2d-stage";
import { playCharacter } from "@/lib/live2d/character-bus";
import {
  isOutfitId,
  LIVE2D_STORAGE,
  otherOutfit,
  OUTFIT_LABELS,
  type OutfitId,
} from "@/lib/live2d/outfits";

function readStoredOutfit(): OutfitId {
  try {
    const raw = localStorage.getItem(LIVE2D_STORAGE.outfit);
    if (isOutfitId(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "clothes1";
}

function readStoredCollapsed(defaultCollapsed: boolean): boolean {
  try {
    const raw = localStorage.getItem(LIVE2D_STORAGE.collapsed);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
    /* ignore */
  }
  return defaultCollapsed;
}

function writeOutfit(outfit: OutfitId) {
  try {
    localStorage.setItem(LIVE2D_STORAGE.outfit, outfit);
  } catch {
    /* ignore */
  }
}

function writeCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(LIVE2D_STORAGE.collapsed, collapsed ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function subscribeAlways() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribeAlways, () => true, () => false);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function CharacterDock() {
  const pathname = usePathname() || "/";
  const onWorkbench = pathname.startsWith("/workbench");
  const isClient = useIsClient();
  const reducedMotion = usePrefersReducedMotion();

  const [ready, setReady] = useState(false);
  const [outfit, setOutfit] = useState<OutfitId>("clothes1");
  const [collapsed, setCollapsed] = useState(onWorkbench);
  const [prefsReady, setPrefsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seenOutfits, setSeenOutfits] = useState<Set<OutfitId>>(
    () => new Set(),
  );

  // Client-only preference hydrate during render (avoids setState-in-effect).
  if (isClient && !prefsReady) {
    setOutfit(readStoredOutfit());
    setCollapsed(readStoredCollapsed(onWorkbench));
    setPrefsReady(true);
  }

  useEffect(() => {
    if (!prefsReady) return;
    writeOutfit(outfit);
  }, [outfit, prefsReady]);

  useEffect(() => {
    if (!prefsReady) return;
    writeCollapsed(collapsed);
  }, [collapsed, prefsReady]);

  const dockClass = [
    "fm-character-dock",
    collapsed ? "is-collapsed" : "",
    onWorkbench ? "is-workbench" : "",
    ready ? "is-ready" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={dockClass} aria-label="数字人角色坞">
      <div className="fm-character-dock-chrome">
        <div className="fm-character-dock-meta">
          <span className="fm-character-dock-label">
            {OUTFIT_LABELS[outfit]}
          </span>
          {error ? (
            <span className="fm-character-dock-error" title={error}>
              加载失败
            </span>
          ) : null}
        </div>
        <div className="fm-character-dock-actions">
          <button
            type="button"
            className="fm-character-dock-btn"
            onPointerDown={() => playCharacter("surprise")}
            onClick={() => {
              const next = otherOutfit(outfit);
              if (!seenOutfits.has(next)) {
                setReady(false);
              }
              setError(null);
              setOutfit(next);
            }}
            aria-label={`切换到${OUTFIT_LABELS[otherOutfit(outfit)]}`}
          >
            换装
          </button>
          <button
            type="button"
            className="fm-character-dock-btn"
            onPointerDown={() => playCharacter(collapsed ? "invite" : "wave")}
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "展开角色坞" : "折叠角色坞"}
          >
            {collapsed ? "展开" : "收起"}
          </button>
        </div>
      </div>

      <div
        className={
          collapsed ? "fm-character-dock-body is-hidden" : "fm-character-dock-body"
        }
        aria-hidden={collapsed}
      >
        {prefsReady ? (
          <Live2DStage
            outfit={outfit}
            reducedMotion={reducedMotion}
            paused={collapsed}
            onReady={() => {
              setReady(true);
              setError(null);
              setSeenOutfits((prev) => {
                const next = new Set(prev);
                next.add(outfit);
                return next;
              });
            }}
            onError={(message) => {
              setError(message);
              setReady(false);
            }}
          />
        ) : (
          <div className="fm-live2d-stage fm-live2d-stage-placeholder" />
        )}
        <p className="fm-character-dock-hint">点击角色可互动</p>
      </div>
    </aside>
  );
}
