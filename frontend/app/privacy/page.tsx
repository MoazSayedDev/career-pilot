"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { StaticPageShell } from "@/components/layout/StaticPageShell";

export default function PrivacyPage() {
  const { t } = useI18n();

  const sections = [1, 2, 3, 4, 5, 6, 7].map((i) => ({
    heading: t(`pages.privacy.s${i}.heading`),
    body: [t(`pages.privacy.s${i}.body1`), t(`pages.privacy.s${i}.body2`)].filter(
      (b) => b && !b.startsWith("pages.privacy"),
    ),
  }));

  return (
    <StaticPageShell title={t("pages.privacy.title")} updated={t("pages.privacy.updated")} sections={sections} />
  );
}
