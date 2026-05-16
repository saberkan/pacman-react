import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Scene from "./Scene";
import { GameProvider, useGameContext } from "../context/GameContext";
import { GAME_STATUS } from "../types/gameStatus";

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

function StatusTriggers() {
  const { setGameStatus } = useGameContext();
  return (
    <div>
      <button type="button" onClick={() => setGameStatus(GAME_STATUS.LOST)}>
        trigger lose
      </button>
      <button type="button" onClick={() => setGameStatus(GAME_STATUS.WON)}>
        trigger win
      </button>
    </div>
  );
}

const sceneProps = { foodSize: 60, border: 20, topScoreBoard: 100 };

function FoodAmountProbe() {
  const { foodAmount } = useGameContext();
  return <span data-testid="food-amount">{foodAmount}</span>;
}

afterEach(() => {
  jest.restoreAllMocks();
});

test("after layout, food dot count matches cols × rows from scene client size", () => {
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
    </GameProvider>
  );

  const cols = Math.floor(sceneWidth / sceneProps.foodSize);
  const rows = Math.floor(sceneHeight / sceneProps.foodSize);

  expect(document.querySelectorAll(".effective-food")).toHaveLength(
    cols * rows
  );
});

test("with remainder pixels, food count matches floor-based grid (tiling math in unit tests)", () => {
  const sceneWidth = 500;
  const sceneHeight = 370;
  jest
    .spyOn(HTMLElement.prototype, "clientWidth", "get")
    .mockReturnValue(sceneWidth);
  jest
    .spyOn(HTMLElement.prototype, "clientHeight", "get")
    .mockReturnValue(sceneHeight);

  const { container } = render(
    <GameProvider>
      <Scene {...sceneProps} />
    </GameProvider>
  );

  const cols = Math.floor(sceneWidth / sceneProps.foodSize);
  const rows = Math.floor(sceneHeight / sceneProps.foodSize);

  expect(container.querySelectorAll(".effective-food")).toHaveLength(
    cols * rows
  );
});

test("sets foodAmount in context to cols × rows when scene size is known", () => {
  const sceneWidth = 300;
  const sceneHeight = 240;
  jest
    .spyOn(HTMLElement.prototype, "clientWidth", "get")
    .mockReturnValue(sceneWidth);
  jest
    .spyOn(HTMLElement.prototype, "clientHeight", "get")
    .mockReturnValue(sceneHeight);

  render(
    <GameProvider>
      <FoodAmountProbe />
      <Scene {...sceneProps} />
    </GameProvider>
  );

  const expected =
    Math.floor(sceneWidth / sceneProps.foodSize) *
    Math.floor(sceneHeight / sceneProps.foodSize);

  expect(screen.getByTestId("food-amount")).toHaveTextContent(
    String(expected)
  );
});

test("shows game over overlay with try again", async () => {
  render(
    <GameProvider>
      <StatusTriggers />
      <Scene {...sceneProps} />
    </GameProvider>
  );

  await userEvent.click(screen.getByRole("button", { name: /trigger lose/i }));
  expect(screen.getByText(/GAME OVER/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
});

test("shows win overlay with play again", async () => {
  render(
    <GameProvider>
      <StatusTriggers />
      <Scene {...sceneProps} />
    </GameProvider>
  );

  await userEvent.click(screen.getByRole("button", { name: /trigger win/i }));
  expect(screen.getByText(/Congratulations/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Play again/i })).toBeInTheDocument();
});

test("try again dismisses game over and returns to active play", async () => {
  render(
    <GameProvider>
      <StatusTriggers />
      <Scene {...sceneProps} />
    </GameProvider>
  );

  await userEvent.click(screen.getByRole("button", { name: /trigger lose/i }));
  await userEvent.click(screen.getByRole("button", { name: /Try Again/i }));

  expect(screen.queryByText(/GAME OVER/i)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Try Again/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/Set Difficulty/i)).not.toBeInTheDocument();
});
