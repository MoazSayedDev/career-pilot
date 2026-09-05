"use client";

import { cn } from "../../utils";
import { useI18n } from "@/lib/i18n/I18nProvider";

type BadgeColor = "gray" | "green" | "blue" | "amber";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
}

const colors: Record<BadgeColor, string> = {
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
};

export function Badge({ children, color = "gray" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        colors[color]
      )}
    >
      {children}
    </span>
  );
}

/** Receives the raw backend level ("BEGINNER", …) and renders it localized. */
export function SkillLevelBadge({ level }: { level: string }) {
  const { t } = useI18n();

  const map: Record<string, BadgeColor> = {
    BEGINNER: "gray",
    INTERMEDIATE: "blue",
    ADVANCED: "amber",
    EXPERT: "blue",
  };
  return <Badge color={map[level] || "gray"}>{t(`skillLevel.${level}`)}</Badge>;
}
