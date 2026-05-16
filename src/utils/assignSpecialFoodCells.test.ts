import {
  assignSpecialFoodCells,
  SPECIAL_FOOD_FRACTION,
} from "./assignSpecialFoodCells";

test("assignSpecialFoodCells uses SPECIAL_FOOD_FRACTION threshold per cell", () => {
  const draws = [0.05, 0.15, 0.05, 0.15];
  let i = 0;
  const random = () => draws[i++] ?? 0.5;

  const cells = assignSpecialFoodCells(2, 1, random);
  expect(cells.has("0-0")).toBe(true);
  expect(cells.has("0-1")).toBe(false);
  expect(SPECIAL_FOOD_FRACTION).toBe(0.1);
});

test("assignSpecialFoodCells iterates full grid", () => {
  let count = 0;
  const random = () => {
    count++;
    return 0.5;
  };
  assignSpecialFoodCells(3, 4, random);
  expect(count).toBe(12);
});
