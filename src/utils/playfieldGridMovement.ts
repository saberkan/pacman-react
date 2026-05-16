import { Position } from "../types/position";
import { DIRECTION, Direction } from "../types/direction";

/** Pellet grid: characters sit at cell corners (col×cellWidth, row×cellHeight). */
export type PlayfieldGrid = {
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
};

/** Snap to nearest valid pellet cell (same coordinates Food uses). */
export function snapPositionToFoodGrid(
  position: Position,
  grid: PlayfieldGrid
): Position {
  const { cellWidth, cellHeight, cols, rows } = grid;
  if (cols <= 0 || rows <= 0 || cellWidth <= 0 || cellHeight <= 0) {
    return position;
  }
  let col = Math.round(position.left / cellWidth);
  let row = Math.round(position.top / cellHeight);
  col = Math.max(0, Math.min(cols - 1, col));
  row = Math.max(0, Math.min(rows - 1, row));
  return { left: col * cellWidth, top: row * cellHeight };
}

/** One orthogonal step; returns null if that cell is outside the grid (blocked). */
export function stepOnFoodGrid(
  position: Position,
  direction: Direction,
  grid: PlayfieldGrid
): Position | null {
  const { cellWidth, cellHeight, cols, rows } = grid;
  if (cols <= 0 || rows <= 0 || cellWidth <= 0 || cellHeight <= 0) {
    return null;
  }

  let col = Math.round(position.left / cellWidth);
  let row = Math.round(position.top / cellHeight);
  col = Math.max(0, Math.min(cols - 1, col));
  row = Math.max(0, Math.min(rows - 1, row));

  switch (direction) {
    case DIRECTION.LEFT:
      col -= 1;
      break;
    case DIRECTION.RIGHT:
      col += 1;
      break;
    case DIRECTION.UP:
      row -= 1;
      break;
    case DIRECTION.DOWN:
      row += 1;
      break;
    default:
      return null;
  }

  if (col < 0 || col >= cols || row < 0 || row >= rows) {
    return null;
  }
  return { left: col * cellWidth, top: row * cellHeight };
}
