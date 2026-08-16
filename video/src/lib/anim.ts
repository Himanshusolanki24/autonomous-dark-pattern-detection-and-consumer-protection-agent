import { interpolate, spring, type SpringConfig } from "remotion";

// ─── Spring presets ────────────────────────────────────────────────────────────
const SPRING_GENTLE: SpringConfig = { damping: 24, stiffness: 180, mass: 1 };
const SPRING_SNAPPY: SpringConfig = { damping: 20, stiffness: 260, mass: 0.8 };
const SPRING_SOFT: SpringConfig   = { damping: 30, stiffness: 120, mass: 1 };

export function fadeIn(frame: number, delay = 0, duration = 20): number {
  return interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function fadeOut(frame: number, start: number, duration = 12): number {
  return interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function slideUp(
  frame: number,
  delay = 0,
  distance = 24,
  fps = 30
): number {
  return spring({
    frame: frame - delay,
    fps,
    config: SPRING_GENTLE,
    from: distance,
    to: 0,
  });
}

export function slideIn(
  frame: number,
  delay = 0,
  distance = 40,
  fps = 30
): number {
  return spring({
    frame: frame - delay,
    fps,
    config: SPRING_SNAPPY,
    from: distance,
    to: 0,
  });
}

export function scaleIn(
  frame: number,
  delay = 0,
  fps = 30
): number {
  return spring({
    frame: frame - delay,
    fps,
    config: SPRING_SNAPPY,
    from: 0.88,
    to: 1,
  });
}

export function scalePop(
  frame: number,
  delay = 0,
  fps = 30
): number {
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 340, mass: 0.7 },
    from: 0.5,
    to: 1,
  });
}

export function gentleScale(
  frame: number,
  delay = 0,
  fps = 30
): number {
  return spring({
    frame: frame - delay,
    fps,
    config: SPRING_SOFT,
    from: 0.94,
    to: 1,
  });
}

/** Stagger helper — returns the frame offset for item at index */
export function staggerDelay(index: number, stagger = 8): number {
  return index * stagger;
}

/** Clamp a value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/** Pulse opacity for a blinking indicator */
export function pulse(frame: number, period = 40): number {
  return 0.5 + 0.5 * Math.sin((frame / period) * Math.PI * 2);
}
