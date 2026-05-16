import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

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

test("renders game shell with title and score", () => {
  render(<App />);
  expect(screen.getByText("PACMAN")).toBeInTheDocument();
  expect(screen.getByText(/Score:/i)).toBeInTheDocument();
  expect(screen.getByText(/Time elapsed:/i)).toBeInTheDocument();
});

test("shows ready screen with Start", () => {
  render(<App />);
  expect(screen.getByRole("button", { name: /^Start$/ })).toBeInTheDocument();
});

test("starts game when Start is clicked", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: /^Start$/ }));
  expect(
    screen.queryByRole("button", { name: /^Start$/ })
  ).not.toBeInTheDocument();
});
