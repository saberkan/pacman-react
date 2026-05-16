/**
 * Relative movement tick rate vs the original baseline (1 = unchanged).
 * 0.7 lengthens each movement tick by 1/0.7 (~30% fewer ticks per second).
 */
export const GAMEPLAY_SPEED = 0.7;

const BASE_MOVEMENT_TICK_MS = 100;

/** Milliseconds between Pacman/Ghost grid movement ticks. */
export const MOVEMENT_TICK_MS = Math.round(
  BASE_MOVEMENT_TICK_MS / GAMEPLAY_SPEED
);
