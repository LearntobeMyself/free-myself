export type OutfitId = "clothes1" | "clothes2";

export const OUTFIT_IDS: OutfitId[] = ["clothes1", "clothes2"];

export const OUTFIT_LABELS: Record<OutfitId, string> = {
  clothes1: "服装一",
  clothes2: "服装二",
};

export function modelPathFor(outfit: OutfitId): string {
  return `/live2d/${outfit}/${outfit}.model3.json`;
}

export const LIVE2D_STORAGE = {
  outfit: "fm-live2d-outfit",
  collapsed: "fm-live2d-collapsed",
} as const;

export function isOutfitId(value: string | null | undefined): value is OutfitId {
  return value === "clothes1" || value === "clothes2";
}

export function otherOutfit(outfit: OutfitId): OutfitId {
  return outfit === "clothes1" ? "clothes2" : "clothes1";
}
