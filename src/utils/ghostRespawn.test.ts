import { centerRespawnPosition } from "./ghostRespawn";

test("centerRespawnPosition uses middle row and spreads columns by slot", () => {
  const grid = { cols: 8, rows: 6, cellWidth: 60, cellHeight: 60 };
  expect(centerRespawnPosition(grid, 0)).toEqual({ left: 120, top: 120 });
  expect(centerRespawnPosition(grid, 1)).toEqual({ left: 240, top: 120 });
});

test("centerRespawnPosition clamps on narrow grids", () => {
  const grid = { cols: 1, rows: 4, cellWidth: 60, cellHeight: 60 };
  expect(centerRespawnPosition(grid, 0)).toEqual({ left: 0, top: 60 });
  expect(centerRespawnPosition(grid, 1)).toEqual({ left: 0, top: 60 });
});
