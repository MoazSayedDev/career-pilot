"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "careerpilot_theme";

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: string | null): value is Theme =>
  value === "light" || value === "dark";

/**
 * Reads the effective theme: the saved choice when present, otherwise
 * the operating-system preference. Safe to call on the server.
 */
export const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (isTheme(saved)) return saved;

  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
};

/**
 * Applies (or removes) the `dark` class on <html>.
 */
const applyThemeClass = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export interface ThemeContextValue {
  theme: Theme;
  /** True when the user has not picked a theme and we follow the system. */
  followsSystem: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialTheme = "light",
}: {
  children: ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [followsSystem, setFollowsSystem] = useState(true);

  // Sync with the theme the inline bootstrap script already applied.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (isTheme(saved)) {
      setThemeState(saved);
      setFollowsSystem(false);
    } else {
      setThemeState(
        window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light",
      );
      setFollowsSystem(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // While following the system, track OS-level scheme changes live.
  useEffect(() => {
    if (!followsSystem) return;

    const media = window.matchMedia(DARK_MEDIA_QUERY);

    const onChange = (event: MediaQueryListEvent) => {
      setThemeState(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", onChange);

    return () => media.removeEventListener("change", onChange);
  }, [followsSystem]);

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setFollowsSystem(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, followsSystem, setTheme, toggleTheme }),
    [theme, followsSystem, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside a <ThemeProvider>");
  }

  return context;
}
