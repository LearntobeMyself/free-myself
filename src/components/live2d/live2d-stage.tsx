"use client";

import { useEffect, useRef } from "react";
import {
  pickMotionIndex,
  type CharacterBehavior,
} from "@/lib/live2d/action-map";
import { onCharacterPlay, playCharacter } from "@/lib/live2d/character-bus";
import { loadCubismCore } from "@/lib/live2d/load-core";
import { lockHandMorphs } from "@/lib/live2d/lock-hands";
import {
  modelPathFor,
  otherOutfit,
  type OutfitId,
} from "@/lib/live2d/outfits";

type PixiApplication = import("pixi.js").Application;
type Live2DModelInstance = import("pixi-live2d-display/cubism4").Live2DModel;
type Live2DModelCtor = typeof import("pixi-live2d-display/cubism4").Live2DModel;

type Live2DStageProps = {
  outfit: OutfitId;
  reducedMotion: boolean;
  paused?: boolean;
  onReady?: () => void;
  onError?: (message: string) => void;
};

/** pixi-live2d-display MotionPriority.FORCE */
const MOTION_PRIORITY_FORCE = 3;

let tickerRegistered = false;

function ensureTicker(
  Live2DModel: Live2DModelCtor,
  Ticker: typeof import("pixi.js").Ticker,
) {
  if (!tickerRegistered) {
    Live2DModel.registerTicker(Ticker);
    tickerRegistered = true;
  }
}

function fitModel(model: Live2DModelInstance, width: number, height: number) {
  const bounds = model.getLocalBounds();
  const modelW = Math.max(bounds.width, 1);
  const modelH = Math.max(bounds.height, 1);
  const padX = width * 0.1;
  const padTop = height * 0.08;
  const padBottom = height * 0.04;
  const scale = Math.min(
    (width - padX * 2) / modelW,
    (height - padTop - padBottom) / modelH,
  );
  model.anchor.set(0.5, 1);
  model.scale.set(scale);
  model.x = width / 2;
  model.y = height - padBottom;
}

function playIdle(model: Live2DModelInstance, reduced: boolean) {
  if (reduced) return;
  void model.motion("Idle");
}

function playBehavior(
  model: Live2DModelInstance,
  behavior: CharacterBehavior,
  reduced: boolean,
) {
  if (reduced) return;
  const defs = model.internalModel.motionManager.definitions.TapBody;
  const count = defs?.length ?? 0;
  if (count <= 0) {
    console.error("[live2d] TapBody motions missing — cannot play", behavior);
    return;
  }
  const index = pickMotionIndex(behavior, count);
  if (index === null) return;
  void model.motion("TapBody", index, MOTION_PRIORITY_FORCE);
}

function waitForBoot(
  bootReadyRef: { current: boolean },
  cancelled: () => boolean,
): Promise<boolean> {
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      if (cancelled()) {
        resolve(false);
        return;
      }
      if (bootReadyRef.current) {
        resolve(true);
        return;
      }
      i += 1;
      if (i >= 100) {
        resolve(false);
        return;
      }
      setTimeout(tick, 50);
    };
    tick();
  });
}

export function Live2DStage({
  outfit,
  reducedMotion,
  paused = false,
  onReady,
  onError,
}: Live2DStageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PixiApplication | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<Live2DModelInstance | null>(null);
  const cacheRef = useRef<Map<OutfitId, Live2DModelInstance>>(new Map());
  const unlockHandsRef = useRef<Map<OutfitId, () => void>>(new Map());
  const inflightRef = useRef<Map<OutfitId, Promise<Live2DModelInstance>>>(
    new Map(),
  );
  const Live2DModelRef = useRef<Live2DModelCtor | null>(null);
  const bootReadyRef = useRef(false);
  const disposedRef = useRef(false);
  const loadTokenRef = useRef(0);
  const reducedRef = useRef(reducedMotion);
  const pausedRef = useRef(paused);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  const outfitRef = useRef(outfit);

  useEffect(() => {
    reducedRef.current = reducedMotion;
    pausedRef.current = paused;
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
    outfitRef.current = outfit;
  }, [reducedMotion, paused, onReady, onError, outfit]);

  const showModel = (model: Live2DModelInstance) => {
    const app = appRef.current;
    const host = hostRef.current;
    if (!app || !host) return;

    const prev = modelRef.current;
    if (prev && prev !== model) {
      if (prev.parent) app.stage.removeChild(prev);
      try {
        prev.internalModel.motionManager.stopAllMotions();
      } catch {
        /* ignore */
      }
    }

    const w = host.clientWidth || 220;
    const h = host.clientHeight || 280;
    fitModel(model, w, h);
    if (!model.parent) app.stage.addChild(model);
    modelRef.current = model;
    if (!pausedRef.current) playIdle(model, reducedRef.current);
    onReadyRef.current?.();
  };

  const ensureModel = async (
    id: OutfitId,
  ): Promise<Live2DModelInstance | null> => {
    const cached = cacheRef.current.get(id);
    if (cached) return cached;

    const inflight = inflightRef.current.get(id);
    if (inflight) return inflight;

    const Live2DModel = Live2DModelRef.current;
    if (!Live2DModel) return null;

    const promise = Live2DModel.from(modelPathFor(id), {
      autoInteract: false,
      // Preload all TapBody/Idle motions so the first click is not a network wait.
      motionPreload: "ALL" as import("pixi-live2d-display/cubism4").MotionPreloadStrategy,
    }).then((model) => {
      if (disposedRef.current) {
        model.destroy();
        throw new Error("disposed");
      }
      const unlock = lockHandMorphs(model);
      unlockHandsRef.current.set(id, unlock);
      cacheRef.current.set(id, model);
      inflightRef.current.delete(id);
      return model;
    });

    inflightRef.current.set(id, promise);
    try {
      return await promise;
    } catch (err) {
      inflightRef.current.delete(id);
      if (err instanceof Error && err.message === "disposed") {
        return null;
      }
      throw err;
    }
  };

  const prefetchOther = (active: OutfitId) => {
    const next = otherOutfit(active);
    if (cacheRef.current.has(next) || inflightRef.current.has(next)) return;

    const run = () => {
      if (disposedRef.current) return;
      void ensureModel(next).catch(() => {
        /* background prefetch — ignore */
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 2500 });
    } else {
      setTimeout(run, 600);
    }
  };

  // Boot Pixi once.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const unlockHands = unlockHandsRef.current;
    const cache = cacheRef.current;
    const inflight = inflightRef.current;

    disposedRef.current = false;
    let detachResize: (() => void) | undefined;
    let detachPointer: (() => void) | undefined;

    let lastTapAt = 0;
    const onCanvasPointer = () => {
      const now = Date.now();
      if (now - lastTapAt < 280) return;
      lastTapAt = now;
      playCharacter("tap");
    };

    const boot = async () => {
      try {
        await loadCubismCore();
        if (disposedRef.current || !hostRef.current) return;

        const [{ Application, Ticker }, { Live2DModel }] = await Promise.all([
          import("pixi.js"),
          import("pixi-live2d-display/cubism4"),
        ]);

        if (disposedRef.current || !hostRef.current) return;

        ensureTicker(Live2DModel, Ticker);
        Live2DModelRef.current = Live2DModel;

        const width = host.clientWidth || 220;
        const height = host.clientHeight || 280;

        const app = new Application({
          width,
          height,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
          powerPreference: "low-power",
        });

        if (disposedRef.current) {
          app.destroy(true, { children: true });
          return;
        }

        const canvas = app.view as HTMLCanvasElement;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.touchAction = "manipulation";
        canvas.style.cursor = "pointer";
        host.replaceChildren(canvas);
        canvasRef.current = canvas;

        canvas.addEventListener("pointerdown", onCanvasPointer);
        canvas.addEventListener("click", onCanvasPointer);
        detachPointer = () => {
          canvas.removeEventListener("pointerdown", onCanvasPointer);
          canvas.removeEventListener("click", onCanvasPointer);
        };

        app.stage.eventMode = "none";
        appRef.current = app;
        bootReadyRef.current = true;
        if (pausedRef.current) app.stop();

        const onResize = () => {
          if (!appRef.current || !hostRef.current || !modelRef.current) return;
          const w = hostRef.current.clientWidth || 220;
          const h = hostRef.current.clientHeight || 280;
          appRef.current.renderer.resize(w, h);
          fitModel(modelRef.current, w, h);
        };
        window.addEventListener("resize", onResize);
        detachResize = () => window.removeEventListener("resize", onResize);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Live2D 初始化失败";
        onErrorRef.current?.(message);
      }
    };

    void boot();

    return () => {
      disposedRef.current = true;
      detachPointer?.();
      detachResize?.();
      bootReadyRef.current = false;
      loadTokenRef.current += 1;
      canvasRef.current = null;

      for (const unlock of unlockHands.values()) {
        try {
          unlock();
        } catch {
          /* ignore */
        }
      }
      unlockHands.clear();

      for (const model of cache.values()) {
        try {
          model.destroy();
        } catch {
          /* ignore */
        }
      }
      cache.clear();
      inflight.clear();
      modelRef.current = null;

      if (appRef.current) {
        try {
          appRef.current.destroy(true, { children: true });
        } catch {
          /* ignore */
        }
        appRef.current = null;
      }
      Live2DModelRef.current = null;
      host.replaceChildren();
    };
  }, []);

  // Subscribe to global character bus (works even while dock chrome is collapsed).
  useEffect(() => {
    return onCharacterPlay((behavior) => {
      const model = modelRef.current;
      const app = appRef.current;
      if (!model || !app) return;
      const wasPaused = pausedRef.current;
      if (wasPaused) app.start();
      playBehavior(model, behavior, reducedRef.current);
      if (wasPaused) {
        window.setTimeout(() => {
          if (pausedRef.current) app.stop();
        }, 4500);
      }
    });
  }, []);

  // Pause ticker when dock collapsed (freeze frame; keep last pose).
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    if (paused) {
      // Let a just-triggered motion paint one beat before freezing.
      const id = window.setTimeout(() => {
        if (pausedRef.current) app.stop();
      }, 120);
      return () => window.clearTimeout(id);
    }
    app.start();
    if (modelRef.current) playIdle(modelRef.current, reducedRef.current);
  }, [paused]);

  // Show cached model or load; prefetch the other outfit.
  useEffect(() => {
    let cancelled = false;
    const token = ++loadTokenRef.current;
    const active = outfit;

    const run = async () => {
      const ready = await waitForBoot(bootReadyRef, () => cancelled);
      if (!ready || cancelled) {
        if (!cancelled) onErrorRef.current?.("渲染引擎未就绪");
        return;
      }

      try {
        const cached = cacheRef.current.get(active);
        if (cached) {
          if (cancelled || token !== loadTokenRef.current) return;
          showModel(cached);
          prefetchOther(active);
          return;
        }

        const model = await ensureModel(active);
        if (!model || cancelled || token !== loadTokenRef.current) return;
        if (outfitRef.current !== active) return;
        showModel(model);
        prefetchOther(active);
      } catch (err) {
        if (cancelled || token !== loadTokenRef.current) return;
        const message =
          err instanceof Error ? err.message : "模型加载失败";
        onErrorRef.current?.(message);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- outfit-driven swap
  }, [outfit]);

  useEffect(() => {
    const model = modelRef.current;
    if (!model || paused) return;
    if (reducedMotion) {
      model.internalModel.motionManager.stopAllMotions();
      return;
    }
    playIdle(model, false);
  }, [reducedMotion, paused]);

  return (
    <div
      className="fm-live2d-stage"
      role="button"
      tabIndex={0}
      aria-label="点击与数字人互动"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          playCharacter("tap");
        }
      }}
    >
      <div ref={hostRef} className="fm-live2d-canvas-host" />
    </div>
  );
}

