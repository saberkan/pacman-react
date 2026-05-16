/** Target fraction of pellets that use the blinking special styling (~10%). */
export const SPECIAL_FOOD_FRACTION = 0.1;

const cellKey = (row: number, col: number) => `${row}-${col}`;

/**
 * Randomly marks grid cells as special food. Uses inclusive grid indices [0, rows) × [0, cols).
 */
export function assignSpecialFoodCells(
  cols: number,
  rows: number,
  random: () => number = Math.random
): Set<string> {
  const out = new Set<string>();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (random() < SPECIAL_FOOD_FRACTION) {
        out.add(cellKey(row, col));
      }
    }
  }
  return out;
}
