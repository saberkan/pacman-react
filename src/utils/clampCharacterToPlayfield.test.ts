import { clampCharacterToPlayfield } from "./clampCharacterToPlayfield";

const wf = {
  innerWidth: 800,
  innerHeight: 600,
  border: 20,
  topScoreBoard: 100,
};

test("clamps to playfield inner size when provided", () => {
  const playfield = { width: 400, height: 300 };
  expect(
    clampCharacterToPlayfield({ left: 500, top: 400 }, 60, playfield, wf)
  ).toEqual({ left: 340, top: 240 });
  expect(
    clampCharacterToPlayfield({ left: -10, top: -5 }, 60, playfield, wf)
  ).toEqual({ left: 0, top: 0 });
});

test("uses window fallback when playfield is null", () => {
  expect(
    clampCharacterToPlayfield({ left: 9999, top: 9999 }, 60, null, wf)
  ).toEqual({
    left: wf.innerWidth - wf.border - 60,
    top: wf.innerHeight - 60 - wf.border - wf.topScoreBoard,
  });
});
