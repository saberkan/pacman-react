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

test("shows paused menu with difficulty and Play", () => {
  render(<App />);
  expect(screen.getByText("Set Difficulty")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /^Play!$/ })).toBeInTheDocument();
  expect(screen.getByRole("combobox")).toHaveValue("medium");
});

test("starts game when Play is clicked", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: /^Play!$/ }));
  expect(screen.queryByRole("button", { name: /^Play!$/ })).not.toBeInTheDocument();
});

test("can change difficulty before playing", async () => {
  render(<App />);
  const select = screen.getByRole("combobox");
  await userEvent.selectOptions(select, "easy");
  expect(select).toHaveValue("easy");
});
