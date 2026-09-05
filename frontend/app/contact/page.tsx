"use client";

import { Mail, MessageSquare, Bug } from "lucide-react";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { StaticPageShell } from "@/components/layout/StaticPageShell";

const CHANNELS = [
  { icon: Mail, email: "support@careerpilot.com", key: "pages.contact.support" },
  { icon: MessageSquare, email: "privacy@careerpilot.com", key: "pages.contact.privacy" },
  { icon: Bug, email: "security@careerpilot.com", key: "pages.contact.security" },
] as const;

export default function ContactPage() {
  const { t } = useI18n();

  const sections = [1, 2].map((i) => ({
    heading: t(`pages.contact.s${i}.heading`),
    body: [t(`pages.contact.s${i}.body1`)].filter(
      (b) => b && !b.startsWith("pages.contact"),
    ),
  }));

  return (
    <StaticPageShell title={t("pages.contact.title")} sections={sections}>
      <div className="grid gap-4 sm:grid-cols-3">
        {CHANNELS.map(({ icon: Icon, email, key }) => (
          <a
            key={email}
            href={`mailto:${email}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-5 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700/10 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
              <Icon size={18} />
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t(key)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400" dir="ltr">
              {email}
            </span>
          </a>
        ))}
      </div>
    </StaticPageShell>
  );
}
