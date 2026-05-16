import { pacGhostHitBoxOverlap } from "./characterOverlap";

test("pacGhostHitBoxOverlap matches axis-aligned hit boxes", () => {
  expect(
    pacGhostHitBoxOverlap({ left: 0, top: 0 }, { left: 0, top: 0 }, 60),
  ).toBe(true);
  expect(
    pacGhostHitBoxOverlap({ left: 100, top: 100 }, { left: 0, top: 0 }, 60),
  ).toBe(false);
});
