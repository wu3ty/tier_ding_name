import test from "node:test";
import assert from "node:assert/strict";

import {
  SECTOR_ANGLE,
  centerAngleForIndex,
  computeLetterRadius,
  computeSpinTargetRotation,
  formatTime,
  isFinalCountdown,
  normalizeAngle,
  randomIndex,
} from "../src/modules/game-logic.js";

test("formatTime formats mm:ss with leading zeros", () => {
  assert.equal(formatTime(0), "00:00");
  assert.equal(formatTime(7), "00:07");
  assert.equal(formatTime(65), "01:05");
  assert.equal(formatTime(600), "10:00");
});

test("randomIndex can be deterministic with injected rng", () => {
  assert.equal(randomIndex(26, () => 0), 0);
  assert.equal(randomIndex(26, () => 0.9999), 25);
});

test("normalizeAngle keeps values in [0, 360)", () => {
  assert.equal(normalizeAngle(0), 0);
  assert.equal(normalizeAngle(360), 0);
  assert.equal(normalizeAngle(-10), 350);
  assert.equal(normalizeAngle(725), 5);
});

test("centerAngleForIndex follows sector angle", () => {
  assert.equal(centerAngleForIndex(0), 0);
  assert.equal(centerAngleForIndex(1), SECTOR_ANGLE);
  assert.equal(centerAngleForIndex(25), 25 * SECTOR_ANGLE);
});

test("computeLetterRadius scales with wheel and enforces minimum", () => {
  assert.equal(computeLetterRadius(100), 118);
  assert.equal(computeLetterRadius(400), 172);
});

test("computeSpinTargetRotation lands at expected normalized angle", () => {
  const rotation = computeSpinTargetRotation({
    currentRotation: 123,
    targetIndex: 0,
    extraSpins: 6,
  });

  assert.equal(normalizeAngle(rotation), 0);
  assert.ok(rotation > 123);
});

test("isFinalCountdown only true for last 10 seconds before zero", () => {
  assert.equal(isFinalCountdown(11), false);
  assert.equal(isFinalCountdown(10), true);
  assert.equal(isFinalCountdown(1), true);
  assert.equal(isFinalCountdown(0), false);
  assert.equal(isFinalCountdown(-1), false);
});
