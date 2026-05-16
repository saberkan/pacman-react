import { computePlayfieldFoodGrid } from "./computePlayfieldFoodGrid";

test("tiles exact multiples with nominal cell size", () => {
  expect(computePlayfieldFoodGrid(480, 360, 60)).toEqual({
    cols: 8,
    rows: 6,
    cellWidth: 60,
    cellHeight: 60,
  });
});

test("cell pitches multiply to exact inner dimensions", () => {
  const innerWidth = 500;
  const innerHeight = 371;
  const g = computePlayfieldFoodGrid(innerWidth, innerHeight, 60);
  expect(g.cols * g.cellWidth).toBeCloseTo(innerWidth, 10);
  expect(g.rows * g.cellHeight).toBeCloseTo(innerHeight, 10);
});

test("returns zeros for non-positive inputs", () => {
  expect(computePlayfieldFoodGrid(0, 100, 60)).toEqual({
    cols: 0,
    rows: 0,
    cellWidth: 0,
    cellHeight: 0,
  });
});

test("uses a single row or column when inner dimension is smaller than nominal", () => {
  expect(computePlayfieldFoodGrid(40, 50, 60)).toEqual({
    cols: 1,
    rows: 1,
    cellWidth: 40,
    cellHeight: 50,
  });
});
