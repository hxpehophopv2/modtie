// Run: node --experimental-strip-types src/hooks/use-tilt.check.mts
import assert from "node:assert/strict";
import { tiltFacing } from "./use-tilt.ts";

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≉ ${b}`);

near(tiltFacing(0, 0), 1); // flat, screen up → ceiling
near(tiltFacing(180, 0), -1); // flat, screen down → floor
near(tiltFacing(0, 90), 0); // landscape upright on forehead
near(tiltFacing(0, -90), 0); // other landscape side
assert.ok(tiltFacing(0, 45) > 0.6); // tipped back 45° → pass
assert.ok(tiltFacing(180, 45) < -0.6); // past vertical (beta flips to 180) → correct
assert.ok(tiltFacing(-180, -45) < -0.6); // same, other landscape side
console.log("tilt ok");
