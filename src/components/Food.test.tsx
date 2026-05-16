import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Food from "./Food";
import { GameProvider, useGameContext } from "../context/GameContext";
import { GAME_STATUS } from "../types/gameStatus";

test("normal pellet omits special styling marker", () => {
  render(
    <GameProvider>
      <Food
        name="t"
        position={{ left: 0, top: 0 }}
        hidden={false}
        pacmanSize={60}
        variant="normal"
      />
    </GameProvider>,
  );

  expect(screen.getByTestId("food-dot")).toHaveAttribute(
    "data-food-variant",
    "normal",
  );
});

test("special pellet is marked for blinking variant", () => {
  render(
    <GameProvider>
      <Food
        name="t"
        position={{ left: 0, top: 0 }}
        hidden={false}
        pacmanSize={60}
        variant="special"
      />
    </GameProvider>,
  );

  expect(screen.getByTestId("food-dot")).toHaveAttribute(
    "data-food-variant",
    "special",
  );
});

function BootInProgress() {
  const { setGameStatus } = useGameContext();
  React.useLayoutEffect(() => {
    setGameStatus(GAME_STATUS.IN_PROGRESS);
  }, [setGameStatus]);
  return null;
}

function PowerProbe() {
  const { powerModeActive } = useGameContext();
  return (
    <span data-testid="power-mode">{powerModeActive ? "on" : "off"}</span>
  );
}

function MoveOntoPellet() {
  const { setPacmanPosition } = useGameContext();
  return (
    <button
      type="button"
      onClick={() => setPacmanPosition({ left: 200, top: 200 })}
    >
      eat
    </button>
  );
}

test("eating special pellet activates power mode", async () => {
  render(
    <GameProvider>
      <BootInProgress />
      <PowerProbe />
      <Food
        name="t"
        position={{ left: 200, top: 200 }}
        hidden={false}
        pacmanSize={60}
        variant="special"
      />
      <MoveOntoPellet />
    </GameProvider>,
  );

  expect(screen.getByTestId("power-mode")).toHaveTextContent("off");
  await userEvent.click(screen.getByRole("button", { name: /^eat$/i }));
  expect(screen.getByTestId("power-mode")).toHaveTextContent("on");
});

test("eating normal pellet does not activate power mode", async () => {
  render(
    <GameProvider>
      <BootInProgress />
      <PowerProbe />
      <Food
        name="t"
        position={{ left: 200, top: 200 }}
        hidden={false}
        pacmanSize={60}
        variant="normal"
      />
      <MoveOntoPellet />
    </GameProvider>,
  );

  expect(screen.getByTestId("power-mode")).toHaveTextContent("off");
  await userEvent.click(screen.getByRole("button", { name: /^eat$/i }));
  expect(screen.getByTestId("power-mode")).toHaveTextContent("off");
});

function SeedLastPellet() {
  const { setFoodAmount, setPoints, setGameStatus } = useGameContext();
  React.useLayoutEffect(() => {
    setFoodAmount(1);
    setPoints(0);
    setGameStatus(GAME_STATUS.IN_PROGRESS);
  }, [setFoodAmount, setGameStatus, setPoints]);
  return null;
}

function PointsProbe() {
  const { points } = useGameContext();
  return <span data-testid="points">{points}</span>;
}

function StatusProbe() {
  const { gameStatus } = useGameContext();
  return <span data-testid="game-status">{gameStatus}</span>;
}

test("eating a pellet increments points", async () => {
  render(
    <GameProvider>
      <BootInProgress />
      <PointsProbe />
      <Food
        name="t"
        position={{ left: 200, top: 200 }}
        hidden={false}
        pacmanSize={60}
        variant="normal"
      />
      <MoveOntoPellet />
    </GameProvider>,
  );

  expect(screen.getByTestId("points")).toHaveTextContent("0");
  await userEvent.click(screen.getByRole("button", { name: /^eat$/i }));
  expect(screen.getByTestId("points")).toHaveTextContent("1");
});

test("eating the last pellet sets game to WON", async () => {
  render(
    <GameProvider>
      <SeedLastPellet />
      <StatusProbe />
      <PointsProbe />
      <Food
        name="t"
        position={{ left: 200, top: 200 }}
        hidden={false}
        pacmanSize={60}
        variant="normal"
      />
      <MoveOntoPellet />
    </GameProvider>,
  );

  expect(screen.getByTestId("game-status")).toHaveTextContent(
    GAME_STATUS.IN_PROGRESS,
  );
  await userEvent.click(screen.getByRole("button", { name: /^eat$/i }));
  expect(screen.getByTestId("points")).toHaveTextContent("1");
  expect(screen.getByTestId("game-status")).toHaveTextContent(GAME_STATUS.WON);
});
