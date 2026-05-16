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
