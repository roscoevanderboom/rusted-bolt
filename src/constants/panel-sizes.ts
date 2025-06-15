// ======================
// CONSTANTS
// ======================
export const PANEL_SIZES = {
  CHAT_DEFAULT: 30,
  CHAT_FULL: 100,
  IDE_DEFAULT: 70,
  FILE_TREE_DEFAULT: 20,
  FILE_TREE_COLLAPSED: 100,
  EDITOR_DEFAULT: 60,
  CONSOLE_DEFAULT: 30,
} as const;

export const PANEL_CONSTRAINTS = {
  CHAT_MIN: 20,
  CHAT_MAX: 85,
  IDE_MIN: 25,
  EDITOR_MIN: 20,
  CONSOLE_MIN: 10,
  CONSOLE_MAX: 60,
} as const;
