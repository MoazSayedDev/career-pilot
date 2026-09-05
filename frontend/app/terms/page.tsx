"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { StaticPageShell } from "@/components/layout/StaticPageShell";

export default function TermsPage() {
  const { t } = useI18n();

  const sections = [1, 2, 3, 4, 5, 6, 7].map((i) => ({
    heading: t(`pages.terms.s${i}.heading`),
    body: [t(`pages.terms.s${i}.body1`), t(`pages.terms.s${i}.body2`)].filter(
      (b) => b && !b.startsWith("pages.terms"),
    ),
  }));

  return (
    <StaticPageShell title={t("pages.terms.title")} updated={t("pages.terms.updated")} sections={sections} />
  );
}
