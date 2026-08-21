/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#f4faf9",
      "foreground": "#15343b",
      "border": "#d7e8e5",
      "card": "#ffffff",
      "cardForeground": "#15343b",
      "popover": "#ffffff",
      "popoverForeground": "#15343b",
      "primary": "#0f766e",
      "primaryForeground": "#f4fffd",
      "secondary": "#dff4f0",
      "secondaryForeground": "#124e55",
      "muted": "#e8f1f0",
      "mutedForeground": "#5b7378",
      "accent": "#f4c95d",
      "accentForeground": "#5b3a00",
      "destructive": "#c2413b",
      "destructiveForeground": "#fff8f7",
      "input": "#c5dcd9",
      "ring": "#28a99e",
      "chart1": "#168b81",
      "chart2": "#45b7a9",
      "chart3": "#f4c95d",
      "chart4": "#d67568",
      "chart5": "#5576a8",
      "sidebar": "#e9f6f3",
      "sidebarForeground": "#24525a",
      "sidebarBorder": "#cfe5e1",
      "sidebarPrimary": "#0f766e",
      "sidebarPrimaryForeground": "#f4fffd",
      "sidebarAccent": "#cfece7",
      "sidebarAccentForeground": "#124e55",
      "sidebarRing": "#28a99e"
    },
    "dark": {
      "background": "#0c2226",
      "foreground": "#edf8f6",
      "border": "#23484d",
      "card": "#123237",
      "cardForeground": "#edf8f6",
      "popover": "#123237",
      "popoverForeground": "#edf8f6",
      "primary": "#45c7ba",
      "primaryForeground": "#063b37",
      "secondary": "#19464b",
      "secondaryForeground": "#d9f4ef",
      "muted": "#173b40",
      "mutedForeground": "#9ac1be",
      "accent": "#e9b949",
      "accentForeground": "#3b2700",
      "destructive": "#f06a61",
      "destructiveForeground": "#3d100d",
      "input": "#285158",
      "ring": "#72ddd1",
      "chart1": "#45c7ba",
      "chart2": "#77d8c7",
      "chart3": "#e9b949",
      "chart4": "#f08b7e",
      "chart5": "#8eaee0",
      "sidebar": "#102d32",
      "sidebarForeground": "#d9f4ef",
      "sidebarBorder": "#23484d",
      "sidebarPrimary": "#45c7ba",
      "sidebarPrimaryForeground": "#063b37",
      "sidebarAccent": "#19464b",
      "sidebarAccentForeground": "#d9f4ef",
      "sidebarRing": "#72ddd1"
    }
  },
  "fontFamily": {
    "sans": [
      "Plus Jakarta Sans",
      "Inter",
      "sans-serif"
    ],
    "serif": [
      "Georgia",
      "serif"
    ],
    "mono": [
      "Menlo",
      "monospace"
    ]
  },
  "radius": "0.625rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
