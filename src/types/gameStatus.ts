export enum GAME_STATUS {
  READY = "ready",
  IN_PROGRESS = "in_progress",
  PAUSED = "paused",
  LOST = "lost",
  WON = "won",
}

export type GameStatus =
  | GAME_STATUS.READY
  | GAME_STATUS.IN_PROGRESS
  | GAME_STATUS.PAUSED
  | GAME_STATUS.LOST
  | GAME_STATUS.WON;
