"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

import { useI18n } from "@/lib/i18n/I18nProvider";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white px-6 text-center font-sans dark:bg-gray-950">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700/10 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
        <Compass size={30} />
      </span>
      <h1 className="text-6xl font-extrabold text-gray-900 dark:text-gray-100">
        404
      </h1>
      <p className="max-w-md text-sm leading-7 text-gray-500 dark:text-gray-400">
        {t("pages.notFound.message")}
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          {t("pages.notFound.home")}
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {t("pages.notFound.dashboard")}
        </Link>
      </div>
    </div>
  );
}
