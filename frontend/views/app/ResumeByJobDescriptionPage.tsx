"use client";

import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import axios from "axios";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { GeminiKeyManager } from "@/components/ui/GeminiKeyManager";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Textarea";

import { getApiErrorMessage } from "@/lib/api-error";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { translateServerMessage } from "@/lib/server-messages";
import { createResumeByJobDescription } from "@/services/resume/api/resume.service";

/** Mirrors the backend's 4000-character limit on the job description. */
const JOB_DESCRIPTION_MAX_LENGTH = 4000;
const JOB_DESCRIPTION_MIN_LENGTH = 30;

export default function ResumeByJobDescriptionPage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const trimmed = jobDescription.trim();

  const tooShort = useMemo(
    () => trimmed.length > 0 && trimmed.length < JOB_DESCRIPTION_MIN_LENGTH,
    [trimmed],
  );

  const canGenerate =
    !generating &&
    trimmed.length >= JOB_DESCRIPTION_MIN_LENGTH &&
    trimmed.length <= JOB_DESCRIPTION_MAX_LENGTH;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setGenerating(true);
    setError(null);
    setLimitReached(false);

    try {
      const result = await createResumeByJobDescription({
        jobDescription: trimmed,
      });

      router.push(`/resume/preview?id=${result.id}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        router.push("/login");
        return;
      }

      // 403 = monthly usage limit. The GeminiKeyManager on this page is
      // the advertised remedy, so surface a dedicated, prominent message.
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        const message = err.response?.data?.message;
        setLimitReached(true);
        setError(
          (typeof message === "string" && message
            ? translateServerMessage(message, t)
            : "") || t("errors.jdLimitReached"),
        );
        return;
      }

      setError(getApiErrorMessage(err, t("resumeByJd.failed"), t));
    } finally {
      setGenerating(false);
    }
  };

  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={<Wand2 size={26} />}
        title={t("resumeByJd.title")}
        subtitle={t("resumeByJd.subtitle")}
      />

      <Card className="p-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="jd-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("resumeByJd.label")} <span className="text-red-500">*</span>
          </label>

          <Textarea
            value={jobDescription}
            onChange={(value) => {
              setJobDescription(value);
              if (error) setError(null);
              if (limitReached) setLimitReached(false);
            }}
            placeholder={t("resumeByJd.placeholder")}
            rows={9}
            maxLength={JOB_DESCRIPTION_MAX_LENGTH}
          />

          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>
              {jobDescription.length}/{JOB_DESCRIPTION_MAX_LENGTH}{" "}
              {t("common.characters")}
            </span>

            {tooShort && (
              <span className="text-red-500">{t("resumeByJd.tooShort")}</span>
            )}
          </div>

          {error && (
            <div
              className={`mt-2 rounded-lg border px-4 py-3 text-sm ${
                limitReached
                  ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                  : "border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              {limitReached && (
                <p className="mb-1 font-semibold">{t("resumeByJd.limitReached")}</p>
              )}
              <p>{error}</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-3">
            <Btn onClick={() => void handleGenerate()} disabled={!canGenerate}>
              {generating ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {t("resumeByJd.generating")}
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  {t("resumeByJd.generate")}
                </>
              )}
            </Btn>

            <Btn
              variant="outline"
              onClick={() => router.push("/resume/preview")}
              disabled={generating}
            >
              <BackIcon size={15} />
              {t("resumeByJd.back")}
            </Btn>
          </div>
        </div>
      </Card>

      {/* Optional contextual Gemini key management — the workaround for
          the monthly job-description limit. */}
      <div className="mt-5">
        <GeminiKeyManager variant="compact" />
      </div>

      {generating && (
        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <FileText size={16} className="animate-pulse text-blue-600" />
          {t("resumeByJd.generating")}
        </div>
      )}
    </div>
  );
}
