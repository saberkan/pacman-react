import { Position } from "../types/position";
import { DIRECTION } from "../types/direction";
import {
  snapPositionToFoodGrid,
  stepOnFoodGrid,
  PlayfieldGrid,
} from "./playfieldGridMovement";

const grid: PlayfieldGrid = { cols: 5, rows: 4, cellWidth: 60, cellHeight: 60 };

test("snapPositionToFoodGrid clamps to cell corners", () => {
  expect(snapPositionToFoodGrid({ left: 77, top: 130 }, grid)).toEqual({
    left: 60,
    top: 120,
  });
  expect(snapPositionToFoodGrid({ left: -500, top: 9999 }, grid)).toEqual({
    left: 0,
    top: 3 * 60,
  });
});

test("stepOnFoodGrid moves one cell or blocks at edges", () => {
  const start: Position = { left: 120, top: 60 };
  expect(stepOnFoodGrid(start, DIRECTION.RIGHT, grid)).toEqual({
    left: 180,
    top: 60,
  });
  expect(stepOnFoodGrid(start, DIRECTION.LEFT, grid)).toEqual({
    left: 60,
    top: 60,
  });
  expect(stepOnFoodGrid({ left: 0, top: 0 }, DIRECTION.LEFT, grid)).toBeNull();
  expect(
    stepOnFoodGrid({ left: 4 * 60, top: 0 }, DIRECTION.RIGHT, grid)
  ).toBeNull();
});

test("non-square cell pitches snap and step independently", () => {
  const rectGrid: PlayfieldGrid = {
    cols: 4,
    rows: 3,
    cellWidth: 125,
    cellHeight: 100,
  };
  expect(
    snapPositionToFoodGrid({ left: 130, top: 150 }, rectGrid)
  ).toEqual({ left: 125, top: 200 });
  expect(
    stepOnFoodGrid({ left: 125, top: 100 }, DIRECTION.RIGHT, rectGrid)
  ).toEqual({ left: 250, top: 100 });
});
