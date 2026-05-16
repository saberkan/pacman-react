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
