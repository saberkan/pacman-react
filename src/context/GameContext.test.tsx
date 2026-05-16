import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameProvider, useGameContext } from "./GameContext";
import { GAME_STATUS } from "../types/gameStatus";

function TestConsumer() {
  const { points, restartGame, setPoints, gameStatus } = useGameContext();
  return (
    <div>
      <span data-testid="status">{gameStatus}</span>
      <span data-testid="points">{points}</span>
      <button type="button" onClick={() => setPoints(5)}>
        add points
      </button>
      <button type="button" onClick={restartGame}>
        restart
      </button>
    </div>
  );
}

test("restartGame resets score, sets in progress, and dispatches event", async () => {
  const listener = jest.fn();
  document.addEventListener("restart-game", listener);

  render(
    <GameProvider>
      <TestConsumer />
    </GameProvider>
  );

  expect(screen.getByTestId("status")).toHaveTextContent(GAME_STATUS.READY);
  await userEvent.click(screen.getByRole("button", { name: /add points/i }));
  expect(screen.getByTestId("points")).toHaveTextContent("5");

  await userEvent.click(screen.getByRole("button", { name: /restart/i }));

  expect(screen.getByTestId("points")).toHaveTextContent("0");
  expect(screen.getByTestId("status")).toHaveTextContent(GAME_STATUS.IN_PROGRESS);
  expect(listener).toHaveBeenCalledTimes(1);

  document.removeEventListener("restart-game", listener);
});
