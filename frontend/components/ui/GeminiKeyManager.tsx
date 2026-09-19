"use client";

import { ExternalLink, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "./Badge";
import { Btn } from "./Btn";
import { Card } from "./Card";
import { ConfirmDialog } from "./ConfirmDialog";
import { PasswordInput } from "./PasswordInput";

import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  deleteGeminiKey,
  getGeminiKeyStatus,
  setGeminiKey,
  updateGeminiKey,
} from "@/services/ai/api/ai.service";

interface GeminiKeyManagerProps {
  /**
   * "full"   — standalone settings card (title + description + management).
   * "compact" — contextual strip for the job-description page
   *             (badge + quick add without the surrounding card chrome).
   */
  variant?: "full" | "compact";
}

/**
 * Shared manager for the user's personal Gemini API key.
 *
 * Security notes baked into the component:
 *  - The key lives in a `type="password"` input and is cleared from
 *    state immediately after a successful save (never persisted to
 *    localStorage / sessionStorage / cookies, never logged, never
 *    embedded in error messages).
 *  - The configured key itself never reaches the client — only the
 *    boolean `configured` flag from the status endpoint.
 */
export function GeminiKeyManager({ variant = "full" }: GeminiKeyManagerProps) {
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);

  const [keyValue, setKeyValue] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  useEffect(() => {
    const load = async () => {
      try {
        const status = await getGeminiKeyStatus();
        setConfigured(status.configured);
      } catch {
        // Status fetch failure is non-fatal: assume not configured and
        // let the user try to add a key (the save request surfaces
        // real errors).
        setConfigured(false);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleSave = async () => {
    const apiKey = keyValue.trim();

    if (!apiKey || saving) return;

    setSaving(true);
    setFeedback(null);

    try {
      // POST for first-time add, PUT for replacing an existing key.
      if (configured) {
        await updateGeminiKey({ apiKey });
      } else {
        await setGeminiKey({ apiKey });
      }

      // Drop the secret from memory immediately — even the success
      // path must not retain it.
      setKeyValue("");
      setEditing(false);
      setConfigured(true);
      setFeedback({ type: "success", text: t("gemini.saved") });
    } catch {
      setFeedback({ type: "error", text: t("gemini.saveFailed") });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setConfirmOpen(false);
    setRemoving(true);
    setFeedback(null);

    try {
      await deleteGeminiKey();
      setConfigured(false);
      setEditing(false);
      setKeyValue("");
      setFeedback({ type: "success", text: t("gemini.removed") });
    } catch {
      setFeedback({ type: "error", text: t("gemini.removeFailed") });
    } finally {
      setRemoving(false);
    }
  };

  const startEditing = () => {
    setKeyValue("");
    setEditing(true);
    setFeedback(null);
  };

  const cancelEditing = () => {
    setKeyValue("");
    setEditing(false);
    setFeedback(null);
  };

  const showInput = editing || (!configured && !loading);

  /** Official Google AI Studio key-management page (opens in a new tab). */
  const AI_STUDIO_API_KEYS_URL = "https://aistudio.google.com/app/apikey";

  const input = (
    <div className="flex flex-col gap-2">
      <PasswordInput
        value={keyValue}
        onChange={(event) => setKeyValue(event.target.value)}
        placeholder={t("gemini.placeholder")}
        disabled={saving}
        icon={<KeyRound size={15} />}
      />

      {/* Where to get a key — "Google AI Studio" is the link itself. */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t("gemini.getKeyHintPrefix")}
        <a
          href={AI_STUDIO_API_KEYS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 transition-colors hover:text-blue-800 hover:decoration-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:text-blue-400 dark:decoration-blue-500/50 dark:hover:text-blue-300"
        >
          {t("gemini.getKeyHintLink")}
          <ExternalLink size={11} aria-hidden="true" />
        </a>
        {t("gemini.getKeyHintSuffix")}
      </p>

      {/* Security note — visible but deliberately understated. */}
      <p className="flex items-start gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{t("gemini.securityHint")}</span>
      </p>

      <div className="flex items-center gap-2">
        <Btn onClick={() => void handleSave()} disabled={!keyValue.trim() || saving}>
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {t("gemini.saving")}
            </>
          ) : (
            t("gemini.save")
          )}
        </Btn>

        {editing && (
          <Btn variant="outline" onClick={cancelEditing} disabled={saving}>
            {t("common.cancel")}
          </Btn>
        )}
      </div>
    </div>
  );

  if (variant === "compact") {
    return (
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-blue-700 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {t("gemini.title")}
            </span>
            <Badge color={configured ? "green" : "gray"}>
              {configured ? t("gemini.configured") : t("gemini.notConfigured")}
            </Badge>
          </div>

          {!showInput && (
            <div className="flex items-center gap-2">
              <Btn size="sm" variant="outline" onClick={startEditing}>
                {configured ? t("gemini.update") : t("gemini.add")}
              </Btn>

              {configured && (
                <Btn
                  size="sm"
                  variant="danger"
                  onClick={() => setConfirmOpen(true)}
                  disabled={removing}
                >
                  {removing ? t("gemini.removing") : t("gemini.remove")}
                </Btn>
              )}
            </div>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {t("gemini.description")}
        </p>

        {showInput && <div className="mt-3">{input}</div>}

        {feedback && (
          <p
            className={`mt-2 text-xs ${
              feedback.type === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500"
            }`}
          >
            {feedback.text}
          </p>
        )}

        <ConfirmDialog
          open={confirmOpen}
          title={t("gemini.remove")}
          message={t("gemini.removeConfirm")}
          confirmLabel={t("gemini.remove")}
          onConfirm={() => void handleRemove()}
          onCancel={() => setConfirmOpen(false)}
        />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {t("gemini.title")}
          </h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {t("gemini.description")}
          </p>
        </div>

        <Badge color={configured ? "green" : "gray"}>
          {configured ? t("gemini.configured") : t("gemini.notConfigured")}
        </Badge>
      </div>

      {!showInput && !loading && (
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="outline" onClick={startEditing}>
            {t("gemini.update")}
          </Btn>

          <Btn
            variant="danger"
            onClick={() => setConfirmOpen(true)}
            disabled={removing}
          >
            {removing ? t("gemini.removing") : t("gemini.remove")}
          </Btn>
        </div>
      )}

      {showInput && input}

      <p className="mt-4 text-xs leading-relaxed text-gray-400 dark:text-gray-500">
        {t("gemini.disclaimer")}
      </p>

      {feedback && (
        <p
          className={`mt-2 text-xs ${
            feedback.type === "success"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={t("gemini.remove")}
        message={t("gemini.removeConfirm")}
        confirmLabel={t("gemini.remove")}
        onConfirm={() => void handleRemove()}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
  );
}
