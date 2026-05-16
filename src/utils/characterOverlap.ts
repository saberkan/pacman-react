import { Position } from "../types/position";

/** Same hit box as Ghost collision vs Pac-Man (top-left positions, square size). */
export function pacGhostHitBoxOverlap(
  pac: Position,
  ghost: Position,
  size: number,
): boolean {
  return (
    pac.left > ghost.left - size &&
    pac.left < ghost.left + size &&
    pac.top > ghost.top - size &&
    pac.top < ghost.top + size
  );
}
