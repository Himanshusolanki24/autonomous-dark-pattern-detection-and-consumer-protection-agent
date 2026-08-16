// ─── Design Tokens ────────────────────────────────────────────────────────────
export const COLORS = {
  bg: "#f7f7f8",
  surface: "#ffffff",
  surfaceElevated: "#fafafa",
  foreground: "#17181c",
  muted: "#71717a",
  border: "#e4e4e7",
  borderStrong: "#d4d4d8",

  brand: "#2563eb",
  brandSoft: "#eff4ff",
  brandText: "#1d4ed8",

  danger: "#dc2626",
  dangerSoft: "#fef2f2",
  dangerText: "#b91c1c",

  warning: "#d97706",
  warningSoft: "#fffbeb",
  warningText: "#92400e",

  success: "#16a34a",
  successSoft: "#f0fdf4",
  successText: "#15803d",

  // Dark background for contrast scenes
  dark: "#0f0f11",
  darkSurface: "#18181b",
  darkBorder: "#27272a",
  darkMuted: "#71717a",
} as const;

export const FONTS = {
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
} as const;

// ─── Timing ───────────────────────────────────────────────────────────────────
// 30 fps
export const FPS = 30;

// Scene start frames (at 30fps)
export const SCENE_STARTS = {
  s1: 0,    // 0:00 – The Hook
  s2: 240,  // 0:08
  s3: 540,  // 0:18
  s4: 810,  // 0:27
  s5: 1110, // 0:37
  s6: 1470, // 0:49
  s7: 1770, // 0:59
  s8: 2070, // 1:09
  s9: 2400, // 1:20
  s10: 2760,// 1:32
  s11: 3000,// 1:40
  s12: 3300,// 1:50
  end: 3600,// 2:00
} as const;

// Scene durations in frames
export const SCENE_DURATIONS = {
  s1: 240,
  s2: 300,
  s3: 270,
  s4: 300,
  s5: 360,
  s6: 300,
  s7: 300,
  s8: 330,
  s9: 360,
  s10: 240,
  s11: 300,
  s12: 300,
} as const;

export const TOTAL_FRAMES = 3600; // 120s at 30fps
