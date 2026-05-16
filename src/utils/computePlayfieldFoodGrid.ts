/**
 * Derives a pellet grid that tiles the full inner playfield while keeping
 * {@link nominalCellSize} as the minimum cell dimension when the playfield
 * is at least that large along each axis (so 60×60 characters still fit).
 *
 * Uses floor(column/row counts) so cells are never smaller than the nominal
 * size; remainder pixels are absorbed into slightly larger cells via
 * innerWidth/cols and innerHeight/rows.
 */
export type ComputedPlayfieldFoodGrid = {
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
};

export function computePlayfieldFoodGrid(
  innerWidth: number,
  innerHeight: number,
  nominalCellSize: number
): ComputedPlayfieldFoodGrid {
  if (
    innerWidth <= 0 ||
    innerHeight <= 0 ||
    nominalCellSize <= 0
  ) {
    return { cols: 0, rows: 0, cellWidth: 0, cellHeight: 0 };
  }

  const cols = Math.max(1, Math.floor(innerWidth / nominalCellSize));
  const rows = Math.max(1, Math.floor(innerHeight / nominalCellSize));

  return {
    cols,
    rows,
    cellWidth: innerWidth / cols,
    cellHeight: innerHeight / rows,
  };
}
