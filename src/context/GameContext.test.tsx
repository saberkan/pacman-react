import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameProvider, useGameContext } from "./GameContext";
import { GAME_STATUS } from "../types/gameStatus";

function TestConsumer() {
  const { points, restartGame, setPoints, gameStatus, powerModeActive, startOrRefreshPowerMode } =
    useGameContext();
  return (
    <div>
      <span data-testid="status">{gameStatus}</span>
      <span data-testid="points">{points}</span>
      <span data-testid="power-mode">{powerModeActive ? "on" : "off"}</span>
      <button type="button" onClick={() => setPoints(5)}>
        add points
      </button>
      <button type="button" onClick={startOrRefreshPowerMode}>
        start power
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

test("power mode expires after 5 seconds (fake timers)", async () => {
  jest.useFakeTimers();

  render(
    <GameProvider>
      <TestConsumer />
    </GameProvider>,
  );

  expect(screen.getByTestId("power-mode")).toHaveTextContent("off");
  await userEvent.click(screen.getByRole("button", { name: /start power/i }));
  expect(screen.getByTestId("power-mode")).toHaveTextContent("on");

  act(() => {
    jest.advanceTimersByTime(4_999);
  });
  expect(screen.getByTestId("power-mode")).toHaveTextContent("on");

  act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(screen.getByTestId("power-mode")).toHaveTextContent("off");

  jest.useRealTimers();
});

test("restartGame clears power mode and pending timer", async () => {
  jest.useFakeTimers();

  render(
    <GameProvider>
      <TestConsumer />
    </GameProvider>,
  );

  await userEvent.click(screen.getByRole("button", { name: /start power/i }));
  expect(screen.getByTestId("power-mode")).toHaveTextContent("on");

  await userEvent.click(screen.getByRole("button", { name: /restart/i }));
  expect(screen.getByTestId("power-mode")).toHaveTextContent("off");

  act(() => {
    jest.advanceTimersByTime(60_000);
  });
  expect(screen.getByTestId("power-mode")).toHaveTextContent("off");

  jest.useRealTimers();
});

test("startOrRefreshPowerMode extends the window when triggered again", async () => {
  jest.useFakeTimers();

  render(
    <GameProvider>
      <TestConsumer />
    </GameProvider>,
  );

  await userEvent.click(screen.getByRole("button", { name: /start power/i }));
  act(() => {
    jest.advanceTimersByTime(4_000);
  });
  await userEvent.click(screen.getByRole("button", { name: /start power/i }));
  act(() => {
    jest.advanceTimersByTime(4_000);
  });
  expect(screen.getByTestId("power-mode")).toHaveTextContent("on");
  act(() => {
    jest.advanceTimersByTime(1_000);
  });
  expect(screen.getByTestId("power-mode")).toHaveTextContent("off");

  jest.useRealTimers();
});

function PowerEatHarness() {
  const {
    tryPowerEatFromPacmanMove,
    registerPowerEatGhost,
    startOrRefreshPowerMode,
  } = useGameContext();
  const [eatenCount, setEatenCount] = React.useState(0);

  React.useLayoutEffect(() => {
    return registerPowerEatGhost("g1", {
      getPosition: () => ({ left: 0, top: 0 }),
      size: 60,
      onEaten: () => setEatenCount((c) => c + 1),
    });
  }, [registerPowerEatGhost]);

  return (
    <div>
      <span data-testid="eaten-count">{eatenCount}</span>
      <button
        type="button"
        aria-label="Harness start power mode"
        onClick={startOrRefreshPowerMode}
      >
        start power
      </button>
      <button
        type="button"
        aria-label="Harness try overlap eat"
        onClick={() => tryPowerEatFromPacmanMove({ left: 0, top: 0 }, 60)}
      >
        try overlap
      </button>
      <button
        type="button"
        aria-label="Harness try no overlap eat"
        onClick={() => tryPowerEatFromPacmanMove({ left: 400, top: 400 }, 60)}
      >
        try no overlap
      </button>
    </div>
  );
}

test("tryPowerEatFromPacmanMove does nothing without power mode", async () => {
  render(
    <GameProvider>
      <PowerEatHarness />
    </GameProvider>,
  );

  await userEvent.click(
    screen.getByRole("button", { name: /harness try overlap eat/i }),
  );
  expect(screen.getByTestId("eaten-count")).toHaveTextContent("0");
});

test("tryPowerEatFromPacmanMove calls onEaten when overlapping in power mode", async () => {
  render(
    <GameProvider>
      <PowerEatHarness />
    </GameProvider>,
  );

  await userEvent.click(
    screen.getByRole("button", { name: /harness start power mode/i }),
  );
  await userEvent.click(
    screen.getByRole("button", { name: /harness try overlap eat/i }),
  );
  expect(screen.getByTestId("eaten-count")).toHaveTextContent("1");
});

test("tryPowerEatFromPacmanMove does not call onEaten when not overlapping", async () => {
  render(
    <GameProvider>
      <PowerEatHarness />
    </GameProvider>,
  );

  await userEvent.click(
    screen.getByRole("button", { name: /harness start power mode/i }),
  );
  await userEvent.click(
    screen.getByRole("button", { name: /harness try no overlap eat/i }),
  );
  expect(screen.getByTestId("eaten-count")).toHaveTextContent("0");
});

test("restartGame clears power-eat registry so stale ghosts are not eaten", async () => {
  const listener = jest.fn();
  document.addEventListener("restart-game", listener);

  render(
    <GameProvider>
      <PowerEatHarness />
      <TestConsumer />
    </GameProvider>,
  );

  await userEvent.click(
    screen.getByRole("button", { name: /harness start power mode/i }),
  );
  await userEvent.click(screen.getByRole("button", { name: /restart/i }));
  expect(listener).toHaveBeenCalled();

  await userEvent.click(
    screen.getByRole("button", { name: /harness start power mode/i }),
  );
  await userEvent.click(
    screen.getByRole("button", { name: /harness try overlap eat/i }),
  );
  expect(screen.getByTestId("eaten-count")).toHaveTextContent("0");

  document.removeEventListener("restart-game", listener);
});
