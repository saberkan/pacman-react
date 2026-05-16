import { Position } from "../types/position";
import { PlayfieldGrid, snapPositionToFoodGrid } from "./playfieldGridMovement";

/**
 * Positions for ghosts after power mode ends: mid-row, two slots spread around center column.
 */
export function centerRespawnPosition(
  grid: PlayfieldGrid,
  slotIndex: number,
): Position {
  const midRow = Math.max(0, Math.floor((grid.rows - 1) / 2));
  const midCol = Math.max(0, Math.floor((grid.cols - 1) / 2));
  let col: number;
  if (grid.cols <= 1) {
    col = 0;
  } else {
    const offset = slotIndex <= 0 ? -1 : 1;
    col = Math.min(grid.cols - 1, Math.max(0, midCol + offset));
  }
  const raw: Position = {
    left: col * grid.cellWidth,
    top: midRow * grid.cellHeight,
  };
  return snapPositionToFoodGrid(raw, grid);
}
