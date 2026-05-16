import React from "react";
import { render, screen, act } from "@testing-library/react";
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
