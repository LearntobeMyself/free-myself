import { describe, expect, it } from "vitest";
import {
  isOutfitId,
  modelPathFor,
  otherOutfit,
  OUTFIT_IDS,
  OUTFIT_LABELS,
} from "@/lib/live2d/outfits";

describe("live2d outfits", () => {
  it("exposes both clothing variants", () => {
    expect(OUTFIT_IDS).toEqual(["clothes1", "clothes2"]);
    expect(OUTFIT_LABELS.clothes1).toBeTruthy();
    expect(OUTFIT_LABELS.clothes2).toBeTruthy();
  });

  it("builds model paths under public live2d", () => {
    expect(modelPathFor("clothes1")).toBe(
      "/live2d/clothes1/clothes1.model3.json",
    );
    expect(modelPathFor("clothes2")).toBe(
      "/live2d/clothes2/clothes2.model3.json",
    );
  });

  it("narrows outfit ids", () => {
    expect(isOutfitId("clothes1")).toBe(true);
    expect(isOutfitId("clothes2")).toBe(true);
    expect(isOutfitId("haru")).toBe(false);
    expect(isOutfitId(null)).toBe(false);
  });

  it("toggles the other outfit", () => {
    expect(otherOutfit("clothes1")).toBe("clothes2");
    expect(otherOutfit("clothes2")).toBe("clothes1");
  });
});
