declare global {
  interface Window {
    Live2DCubismCore?: unknown;
  }
}

let corePromise: Promise<void> | null = null;

export function loadCubismCore(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cubism Core requires a browser"));
  }
  if (window.Live2DCubismCore) {
    return Promise.resolve();
  }
  if (corePromise) {
    return corePromise;
  }

  corePromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-fm-cubism-core="1"]',
    );
    if (existing) {
      if (window.Live2DCubismCore) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => {
          corePromise = null;
          reject(new Error("Failed to load Cubism Core"));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "/live2d/core/live2dcubismcore.min.js";
    script.async = true;
    script.dataset.fmCubismCore = "1";
    script.onload = () => resolve();
    script.onerror = () => {
      corePromise = null;
      reject(new Error("Failed to load Cubism Core"));
    };
    document.head.appendChild(script);
  });

  return corePromise;
}
