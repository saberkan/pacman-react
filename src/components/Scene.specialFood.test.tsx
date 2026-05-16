import React from "react";
import { render, screen } from "@testing-library/react";
import Scene from "./Scene";
import { GameProvider } from "../context/GameContext";

jest.mock("../utils/assignSpecialFoodCells", () => ({
  SPECIAL_FOOD_FRACTION: 0.1,
  assignSpecialFoodCells: () => new Set(["0-0", "1-1"]),
}));

const sceneProps = { foodSize: 60, border: 20, topScoreBoard: 100 };

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1024,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: 768,
  });
});

test("scene wires mocked special pellets to data-food-variant", () => {
  const sceneWidth = 480;
  const sceneHeight = 360;
  jest
    .spyOn(HTMLElement.prototype, "clientWidth", "get")
    .mockReturnValue(sceneWidth);
  jest
    .spyOn(HTMLElement.prototype, "clientHeight", "get")
    .mockReturnValue(sceneHeight);

  render(
    <GameProvider>
      <Scene {...sceneProps} />
    </GameProvider>,
  );

  const dots = screen.getAllByTestId("food-dot");
  const cols = Math.floor(sceneWidth / sceneProps.foodSize);
  const rows = Math.floor(sceneHeight / sceneProps.foodSize);
  expect(dots).toHaveLength(cols * rows);

  const specials = dots.filter((el) => el.dataset.foodVariant === "special");
  const normals = dots.filter((el) => el.dataset.foodVariant === "normal");
  expect(specials).toHaveLength(2);
  expect(normals.length).toBeGreaterThan(0);
});
