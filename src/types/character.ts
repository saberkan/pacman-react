export type Character = {
  velocity: number;
  size: number;
  border: number;
  topScoreBoard: number;
  color: string;
  name: string;
  /** Used with centerRespawn after power mode (0 = left-of-center, 1 = right-of-center). */
  respawnSlot?: number;
};
