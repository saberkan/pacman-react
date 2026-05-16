import { Position } from "../types/position";

export type PlayfieldSize = { width: number; height: number };

type WindowFallback = {
  innerWidth: number;
  innerHeight: number;
  border: number;
  topScoreBoard: number;
};

/** Keeps a character's top-left inside the playable rectangle (0 … width − size). */
export function clampCharacterToPlayfield(
  position: Position,
  characterSize: number,
  playfield: PlayfieldSize | null,
  windowFallback: WindowFallback
): Position {
  let maxLeft: number;
  let maxTop: number;

  if (
    playfield &&
    playfield.width >= characterSize &&
    playfield.height >= characterSize
  ) {
    maxLeft = playfield.width - characterSize;
    maxTop = playfield.height - characterSize;
  } else {
    maxLeft = Math.max(
      0,
      windowFallback.innerWidth - windowFallback.border - characterSize
    );
    maxTop = Math.max(
      0,
      windowFallback.innerHeight -
        characterSize -
        windowFallback.border -
        windowFallback.topScoreBoard
    );
  }

  return {
    left: Math.min(Math.max(0, position.left), maxLeft),
    top: Math.min(Math.max(0, position.top), maxTop),
  };
}
