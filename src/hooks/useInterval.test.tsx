import React from "react";
import { render, act } from "@testing-library/react";
import { useInterval } from "./useInterval";

function TickProbe({ onTick }: { onTick: () => void }) {
  useInterval(onTick, 1000);
  return null;
}

test("invokes callback on each interval tick", () => {
  jest.useFakeTimers();
  const cb = jest.fn();

  render(<TickProbe onTick={cb} />);

  expect(cb).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(cb).toHaveBeenCalledTimes(1);

  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(cb).toHaveBeenCalledTimes(2);

  jest.useRealTimers();
});
