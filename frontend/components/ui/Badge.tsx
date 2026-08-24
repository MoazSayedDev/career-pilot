import { cn } from "../../utils";

type BadgeColor = "gray" | "violet" | "green" | "blue" | "amber";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
}

const colors: Record<BadgeColor, string> = {
  gray: "bg-gray-100 text-gray-600",
  violet: "bg-violet-100 text-violet-700",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
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

export function SkillLevelBadge({ level }: { level: string }) {
  const map: Record<string, BadgeColor> = {
    Beginner: "gray",
    Intermediate: "blue",
    Advanced: "amber",
    Expert: "violet",
  };
  return <Badge color={map[level] || "gray"}>{level}</Badge>;
}
