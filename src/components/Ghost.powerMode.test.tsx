import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useInterval } from "../hooks/useInterval";
import Ghost from "./Ghost";
import { GameProvider, useGameContext } from "../context/GameContext";
import { GAME_STATUS } from "../types/gameStatus";
import { COLOR } from "../types/color";

jest.mock("../constants/powerMode", () => ({
  POWER_MODE_DURATION_MS: 80,
}));

jest.mock("../hooks/useInterval", () => ({
  useInterval: jest.fn(),
}));

const mockedUseInterval = useInterval as jest.MockedFunction<typeof useInterval>;

const ghostProps = {
  velocity: 15,
  size: 60,
  border: 20,
  topScoreBoard: 100,
  color: COLOR.RED,
  name: "ghost1",
} as const;

function SeedMiniGrid() {
  const { setPlayfieldGrid, setGameStatus, setPacmanPosition } =
    useGameContext();
  React.useLayoutEffect(() => {
    setPlayfieldGrid({ cols: 1, rows: 1, cellWidth: 60, cellHeight: 60 });
    setGameStatus(GAME_STATUS.IN_PROGRESS);
    setPacmanPosition({ top: 0, left: 0 });
  }, [setPlayfieldGrid, setGameStatus, setPacmanPosition]);
  return null;
}

function GameStatusProbe() {
  const { gameStatus } = useGameContext();
  return <span data-testid="game-status">{gameStatus}</span>;
}

function PowerOn() {
  const { startOrRefreshPowerMode } = useGameContext();
  React.useLayoutEffect(() => {
    startOrRefreshPowerMode();
  }, [startOrRefreshPowerMode]);
  return null;
}

function StartPowerButton() {
  const { startOrRefreshPowerMode } = useGameContext();
  return (
    <button type="button" onClick={startOrRefreshPowerMode}>
      start power
    </button>
  );
}

function PacTryEatOnly() {
  const { tryPowerEatFromPacmanMove } = useGameContext();
  return (
    <button
      type="button"
      onClick={() => tryPowerEatFromPacmanMove({ left: 0, top: 0 }, 60)}
    >
      pac try eat
    </button>
  );
}

beforeEach(() => {
  mockedUseInterval.mockImplementation((fn) => {
    (globalThis as unknown as { __ghostTick?: () => void }).__ghostTick =
      fn as () => void;
  });
});

afterEach(() => {
  mockedUseInterval.mockReset();
  delete (globalThis as unknown as { __ghostTick?: () => void }).__ghostTick;
});

test("ghost overlap does not set LOST while power mode is active", async () => {
  render(
    <GameProvider>
      <SeedMiniGrid />
      <PowerOn />
      <GameStatusProbe />
      <Ghost {...ghostProps} />
    </GameProvider>,
  );

  const tick = (globalThis as unknown as { __ghostTick?: () => void })
    .__ghostTick;
  expect(tick).toBeDefined();

  await act(async () => {
    tick?.();
    await Promise.resolve();
  });

  expect(screen.getByTestId("game-status")).toHaveTextContent(
    GAME_STATUS.IN_PROGRESS,
  );
});

test("ghost overlap sets LOST when power mode is inactive", async () => {
  render(
    <GameProvider>
      <SeedMiniGrid />
      <GameStatusProbe />
      <Ghost {...ghostProps} />
    </GameProvider>,
  );

  const tick = (globalThis as unknown as { __ghostTick?: () => void })
    .__ghostTick;
  expect(tick).toBeDefined();

  await act(async () => {
    tick?.();
    await Promise.resolve();
  });

  expect(screen.getByTestId("game-status")).toHaveTextContent(
    GAME_STATUS.LOST,
  );
});

test("after restart-game, Pac move-based power eat registers ghost again", async () => {
  render(
    <GameProvider>
      <SeedMiniGrid />
      <StartPowerButton />
      <PacTryEatOnly />
      <Ghost {...ghostProps} />
      <button
        type="button"
        onClick={() => document.dispatchEvent(new Event("restart-game"))}
      >
        restart event
      </button>
    </GameProvider>,
  );

  await waitFor(() => {
    expect(screen.getByTestId("ghost1")).toHaveStyle({
      top: "0px",
      left: "0px",
    });
  });

  await userEvent.click(screen.getByRole("button", { name: /^start power$/i }));
  await userEvent.click(screen.getByRole("button", { name: /pac try eat/i }));
  await waitFor(() => {
    expect(screen.queryByTestId("ghost1")).not.toBeInTheDocument();
  });

  await userEvent.click(
    screen.getByRole("button", { name: /restart event/i }),
  );
  expect(screen.getByTestId("ghost1")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: /^start power$/i }));
  await userEvent.click(screen.getByRole("button", { name: /pac try eat/i }));
  await waitFor(() => {
    expect(screen.queryByTestId("ghost1")).not.toBeInTheDocument();
  });
});

test("eaten ghost respawns when power mode expires", async () => {
  render(
    <GameProvider>
      <SeedMiniGrid />
      <PowerOn />
      <Ghost {...ghostProps} respawnSlot={0} />
    </GameProvider>,
  );

  const tick = (globalThis as unknown as { __ghostTick?: () => void })
    .__ghostTick;
  expect(tick).toBeDefined();

  await act(async () => {
    tick?.();
    await Promise.resolve();
  });

  expect(screen.queryByTestId("ghost1")).not.toBeInTheDocument();

  await act(async () => {
    await new Promise((r) => setTimeout(r, 120));
  });

  expect(screen.getByTestId("ghost1")).toBeInTheDocument();
});
