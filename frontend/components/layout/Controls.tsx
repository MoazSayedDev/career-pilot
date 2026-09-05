"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe, Moon, Sun } from "lucide-react";

import { LOCALES, useI18n, type Locale } from "@/lib/i18n/I18nProvider";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { cn } from "@/utils";

/**
 * Light/dark toggle. Shows the sun icon while in dark mode (clicking
 * switches to light) and the moon icon while in light mode.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const isDark = theme === "dark";
  const label = isDark ? t("theme.toLight") : t("theme.toDark");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900",
        "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100",
        className,
      )}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

/**
 * Dropdown for switching the UI language (Arabic / English).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("language.switch")}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t("language.switch")}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
      >
        <Globe size={15} />
        {locale === "ar" ? "ع" : "EN"}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("language.current")}
          className="absolute end-0 top-11 z-50 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {LOCALES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={locale === value}
              // The menu unmounts on click; without preventing the
              // default mousedown the browser turns the gesture into a
              // whole-page text selection.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(value)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700",
                locale === value
                  ? "font-semibold text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-200",
              )}
            >
              {label}
              {locale === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
