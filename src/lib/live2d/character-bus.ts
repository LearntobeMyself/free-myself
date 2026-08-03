import type { CharacterBehavior } from "@/lib/live2d/action-map";

export const CHARACTER_PLAY_EVENT = "fm:character-play";

export type CharacterPlayDetail = {
  behavior: CharacterBehavior;
};

export function playCharacter(behavior: CharacterBehavior): void {
  if (typeof window === "undefined") return;
  // Defer one microtask so pointer handlers return instantly, then fire ASAP.
  queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent<CharacterPlayDetail>(CHARACTER_PLAY_EVENT, {
        detail: { behavior },
      }),
    );
  });
}

export function onCharacterPlay(
  handler: (behavior: CharacterBehavior) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const listener = (event: Event) => {
    const detail = (event as CustomEvent<CharacterPlayDetail>).detail;
    if (!detail?.behavior) return;
    handler(detail.behavior);
  };

  window.addEventListener(CHARACTER_PLAY_EVENT, listener);
  return () => window.removeEventListener(CHARACTER_PLAY_EVENT, listener);
}
