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

import ar from "./locales/ar.json";
import en from "./locales/en.json";

export type Locale = "ar" | "en";

const LOCALE_STORAGE_KEY = "careerpilot_lang";

const MESSAGES: Record<Locale, Record<string, unknown>> = { ar, en };

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "ar", label: ar.language.ar },
  { value: "en", label: en.language.en },
];

export const DEFAULT_LOCALE: Locale = "ar";

const isLocale = (value: string | null): value is Locale =>
  value === "ar" || value === "en";

/**
 * Reads the saved locale from localStorage. Safe to call on the
 * server (returns the default) and before hydration.
 */
export const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);

  return isLocale(saved) ? saved : DEFAULT_LOCALE;
};

/** Resolves a dot-notation path ("auth.signIn.title") inside a message tree. */
const resolve = (tree: Record<string, unknown>, key: string): unknown => {
  let current: unknown = tree;

  for (const part of key.split(".")) {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
};

export interface I18n {
  locale: Locale;
  /** "rtl" for Arabic, "ltr" for English. */
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  /**
   * Translates a dot-notation key with optional {param} interpolation.
   * Falls back to English, then to the raw key so a missing translation
   * is obvious instead of silently rendering an empty string.
   */
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Keep the saved locale (if any) in sync after mount — the inline
  // bootstrap script has already applied lang/dir to <html>.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);

    if (isLocale(saved) && saved !== locale) {
      setLocaleState(saved);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyLocale = useCallback((next: Locale) => {
    const dir = next === "ar" ? "rtl" : "ltr";

    document.documentElement.lang = next;
    document.documentElement.dir = dir;

    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      applyLocale(next);
    },
    [applyLocale],
  );

  useEffect(() => {
    applyLocale(locale);
  }, [locale, applyLocale]);

  const value = useMemo<I18n>(() => {
    const dir: "rtl" | "ltr" = locale === "ar" ? "rtl" : "ltr";

    const t = (key: string, params?: Record<string, string | number>): string => {
      const resolved =
        resolve(MESSAGES[locale], key) ?? resolve(MESSAGES.en, key) ?? key;

      if (typeof resolved !== "string") return key;

      if (!params) return resolved;

      return resolved.replace(/\{(\w+)\}/g, (match, param: string) =>
        param in params ? String(params[param]) : match,
      );
    };

    return { locale, dir, setLocale, t };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside an <I18nProvider>");
  }

  return context;
}
