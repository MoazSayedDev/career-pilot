"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  Files,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";

import { getApiErrorMessage } from "@/lib/api-error";
import { findCvTemplate } from "@/lib/cv-templates";
import { useI18n } from "@/lib/i18n/I18nProvider";

import {
  deleteResume,
  getResumes,
  updateResume,
} from "@/services/resume/api/resume.service";
import type { Resume } from "@/services/resume/types/resume";

export default function CvsPage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [pendingDelete, setPendingDelete] = useState<Resume | null>(null);
  const [renaming, setRenaming] = useState<Resume | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setResumes(null);
      setLoadError(null);

      try {
        const list = await getResumes();

        if (!cancelled) {
          setResumes(list);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            getApiErrorMessage(error, t("cvs.loadFailed"), t),
          );
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  /**
   * Guards every mutating action so a double click can never fire a
   * second request while one is in flight.
   */
  const beginAction = () => {
    if (busyRef.current) return false;

    busyRef.current = true;
    setBusy(true);
    setActionError(null);
    setActionSuccess(null);

    return true;
  };

  const endAction = () => {
    busyRef.current = false;
    setBusy(false);
  };

  const handleRename = async () => {
    if (!renaming || !renameTitle.trim()) return;
    if (!beginAction()) return;

    const targetId = renaming.id;
    const nextTitle = renameTitle.trim();

    try {
      const updated = await updateResume(targetId, {
        title: nextTitle,
      });

      // Merge only the fields the list shows — the list endpoint returns
      // resumes without their sections, so the full details response is
      // reduced back to the list shape.
      setResumes((current) =>
        (current ?? []).map((resume) =>
          resume.id === updated.id
            ? {
                ...resume,
                title: updated.title,
                updatedAt: updated.updatedAt ?? resume.updatedAt,
              }
            : resume,
        ),
      );

      setActionSuccess(t("cvs.renameSuccess"));
      setRenaming(null);
    } catch (error) {
      // Close the dialog so the error banner is visible, matching the
      // delete flow and the project's banner-based feedback pattern.
      setRenaming(null);
      setActionError(getApiErrorMessage(error, t("cvs.actionFailed"), t));
    } finally {
      endAction();
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!beginAction()) return;

    try {
      await deleteResume(resumeId);

      setResumes((current) =>
        (current ?? []).filter((resume) => resume.id !== resumeId),
      );

      setActionSuccess(t("cvs.deleteSuccess"));
      setPendingDelete(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error, t("cvs.actionFailed"), t));
    } finally {
      endAction();
    }
  };

  const openRename = (resume: Resume) => {
    setActionError(null);
    setActionSuccess(null);
    setRenameTitle(resume.title ?? "");
    setRenaming(resume);
  };

  const formatDate = (iso: string | undefined | null): string => {
    if (!iso) return "—";

    const date = new Date(iso);

    if (isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const templateLabel = (resume: Resume): string => {
    const preset = findCvTemplate(resume.template);

    return locale === "ar" ? preset.nameAr : preset.nameEn;
  };

  const documentLanguageLabel = (resume: Resume): string =>
    resume.language === "AR" ? t("cvs.langAR") : t("cvs.langEN");

  const resumeName = (resume: Resume): string =>
    resume.title?.trim() || t("cvs.untitled");

  const hasErrorState = Boolean(loadError);
  const isEmpty = !hasErrorState && resumes !== null && resumes.length === 0;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        icon={<Files size={24} />}
        title={t("cvs.title")}
        subtitle={t("cvs.subtitle")}
      />

      {/* Actions */}
      <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
        <Btn
          variant="outline"
          onClick={() => router.push("/resume/by-job-description")}
        >
          <Sparkles size={16} />
          {t("cvs.createWithAi")}
        </Btn>

        <Btn onClick={() => router.push("/resume")}>
          <Plus size={16} />
          {t("cvs.create")}
        </Btn>
      </div>

      {actionSuccess && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            {actionSuccess}
          </span>

          <button
            type="button"
            aria-label={t("common.cancel")}
            onClick={() => setActionSuccess(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {actionError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <span>{actionError}</span>

          <button
            type="button"
            aria-label={t("common.cancel")}
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {resumes === null && !hasErrorState && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span>{t("cvs.loading")}</span>
          </div>
        </div>
      )}

      {hasErrorState && (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <FileText size={32} className="text-gray-300 dark:text-gray-600" />

          <p className="text-sm text-gray-600 dark:text-gray-400">{loadError}</p>

          <Btn variant="outline" onClick={() => setReloadKey((key) => key + 1)}>
            <RefreshCw size={15} />
            {t("common.retry")}
          </Btn>
        </Card>
      )}

      {isEmpty && (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <FileText size={32} className="text-gray-300 dark:text-gray-600" />

          <p className="font-medium text-gray-900 dark:text-gray-100">
            {t("cvs.empty")}
          </p>

          <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
            {t("cvs.emptyHint")}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Btn onClick={() => router.push("/resume")}>
              <Plus size={16} />
              {t("cvs.create")}
            </Btn>

            <Btn
              variant="outline"
              onClick={() => router.push("/resume/by-job-description")}
            >
              <Sparkles size={16} />
              {t("cvs.createWithAi")}
            </Btn>
          </div>
        </Card>
      )}

      {resumes !== null && resumes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {resumes.map((resume) => (
            <Card key={resume.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-gray-900 dark:text-gray-100">
                    {resumeName(resume)}
                  </h2>

                  <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                      {templateLabel(resume)}
                    </span>

                    <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {documentLanguageLabel(resume)}
                    </span>
                  </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={t("cvs.view", { name: resumeName(resume) })}
                    title={t("cvs.view", { name: resumeName(resume) })}
                    onClick={() =>
                      router.push(`/resume/preview?id=${resume.id}`)
                    }
                    className="p-2 text-gray-500 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    type="button"
                    aria-label={t("cvs.edit", { name: resumeName(resume) })}
                    title={t("cvs.edit", { name: resumeName(resume) })}
                    onClick={() => openRename(resume)}
                    className="p-2 text-gray-500 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    aria-label={t("cvs.delete", { name: resumeName(resume) })}
                    title={t("cvs.delete", { name: resumeName(resume) })}
                    onClick={() => {
                      setActionError(null);
                      setActionSuccess(null);
                      setPendingDelete(resume);
                    }}
                    disabled={busy}
                    className="p-2 text-gray-500 hover:text-red-600 disabled:opacity-50 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <dl className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <div className="flex items-center justify-between gap-3">
                  <dt>{t("cvs.created")}</dt>
                  <dd className="font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(resume.createdAt)}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt>{t("cvs.updated")}</dt>
                  <dd className="font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(resume.updatedAt)}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("common.deleteTitle")}
        message={
          pendingDelete
            ? t("cvs.deleteMessage", { name: resumeName(pendingDelete) })
            : ""
        }
        confirmLabel={t("cvs.deleteConfirm")}
        onConfirm={() => {
          if (pendingDelete) void handleDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => {
          if (!busy) setPendingDelete(null);
        }}
      />

      {renaming && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("cvs.renameTitle")}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!busy) setRenaming(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {t("cvs.renameTitle")}
            </h3>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleRename();
              }}
            >
              <label
                htmlFor="cv-rename-input"
                className="mt-4 mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("cvs.renameLabel")}
              </label>

              <input
                id="cv-rename-input"
                type="text"
                autoFocus
                value={renameTitle}
                onChange={(event) => setRenameTitle(event.target.value)}
                maxLength={150}
                placeholder={t("resume.build.titlePlaceholder")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRenaming(null)}
                  disabled={busy}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="submit"
                  disabled={busy || !renameTitle.trim()}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 dark:hover:bg-blue-600"
                >
                  {busy ? t("cvs.renaming") : t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
