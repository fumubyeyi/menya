// Light/dark theme plumbing. The palette itself lives in styles/theme.css as a
// `:root` (light) block and a `.dark` block; the `dark` class is applied to the
// AppShell wrapper (see AppShell.tsx) so it scopes to the signed-in app and
// leaves the deliberately-light public/login pages alone.

export type Theme = "light" | "dark";
export const THEME_KEY = "menya-theme";

export function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export function systemTheme(): Theme {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Stored choice wins; otherwise follow the OS.
export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? systemTheme();
}
