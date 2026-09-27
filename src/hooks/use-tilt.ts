import { useEffect, useRef, useState } from "react";

// Calibration knobs. TRIGGER 0.6 ≈ 37° past upright; NEUTRAL is how close to upright
// the phone must come back before the next tilt counts.
const TRIGGER = 0.6;
const NEUTRAL = 0.35;

/**
 * Vertical component of the screen normal from W3C Euler angles: cos(beta)·cos(gamma).
 * 0 = upright (on the forehead), +1 = screen faces ceiling, -1 = screen faces floor.
 * Same value in both landscape directions, and no wrap-around at vertical like raw beta/gamma.
 */
export function tiltFacing(beta: number, gamma: number) {
  const rad = Math.PI / 180;
  return Math.cos(beta * rad) * Math.cos(gamma * rad);
}

type DOE = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };

/** iOS 13+: must be called synchronously inside a tap handler. Other platforms need no prompt. */
export async function requestMotionPermission() {
  const req = (globalThis.DeviceOrientationEvent as DOE | undefined)?.requestPermission;
  if (!req) return true;
  try {
    return (await req()) === "granted";
  } catch {
    return false;
  }
}

/** Tilt down → onDown, tilt up → onUp. Keyboard: ↓ or → = onDown, ↑ or ← = onUp (matches the on-screen button sides). */
export function useTilt(enabled: boolean, onDown: () => void, onUp: () => void) {
  const [hasSensor, setHasSensor] = useState<boolean | null>(null);
  const cb = useRef({ onDown, onUp });
  useEffect(() => {
    cb.current = { onDown, onUp };
  });

  useEffect(() => {
    if (!enabled) return;
    let armed = false; // stays off until the phone has been upright once
    let seen = false;

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return; // laptops send one empty event
      if (!seen) setHasSensor((seen = true));
      const f = tiltFacing(e.beta, e.gamma);
      if (!armed) {
        armed = Math.abs(f) < NEUTRAL;
      } else if (Math.abs(f) >= TRIGGER) {
        armed = false;
        if (f < 0) cb.current.onDown();
        else cb.current.onUp();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") cb.current.onDown();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") cb.current.onUp();
    };
    const timer = setTimeout(() => !seen && setHasSensor(false), 1200);

    addEventListener("deviceorientation", onOrientation);
    addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      removeEventListener("deviceorientation", onOrientation);
      removeEventListener("keydown", onKey);
    };
  }, [enabled]);

  return hasSensor;
}
