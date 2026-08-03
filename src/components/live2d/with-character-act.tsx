"use client";

import type { PointerEventHandler } from "react";
import {
  playCharacter,
} from "@/lib/live2d/character-bus";
import type { CharacterBehavior } from "@/lib/live2d/action-map";

/** Merge pointerdown so motion fires before click/navigation. */
export function withCharacterAct<T extends Element>(
  behavior: CharacterBehavior,
  existing?: PointerEventHandler<T>,
): PointerEventHandler<T> {
  return (event) => {
    playCharacter(behavior);
    existing?.(event);
  };
}
