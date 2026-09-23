"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import {
  forgotPassword,
  resendVerificationOtp,
  verifyEmail,
  verifyResetOtp,
} from "../../services/auth/api/auth.service";
import {
  makeVerifyEmailSchema,
  type VerifyEmailFormData,
} from "../../services/auth/schemas/verify-email.schema";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { translateServerMessage } from "@/lib/server-messages";

const OTPPageComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const flow = searchParams?.get("mode") ?? "verify-email";
  const isResetPasswordFlow = flow === "reset-password";

  const verifyEmailSchema = useMemo(() => makeVerifyEmailSchema(t), [t]);

  const {
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onBlur",
    defaultValues: { otp: "" },
  });

  const otpValue = watch("otp") || "";
  const otpDigits = Array.from({ length: 6 }, (_, index) => otpValue[index] ?? "");

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const nextDigits = [...otpDigits];
    nextDigits[index] = value.slice(-1);
    const nextOtp = nextDigits.join("").slice(0, 6);

    setValue("otp", nextOtp, { shouldDirty: true, shouldValidate: true });

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const getEmailFromContext = () => {
    return (
      searchParams?.get("email") ||
      (isResetPasswordFlow
        ? localStorage.getItem("careerpilot_reset_email")
        : localStorage.getItem("careerpilot_verification_email")) ||
      ""
    );
  };

  const handleResendOtp = async () => {
    const email = getEmailFromContext();

    if (!email) {
      setError("root", {
        type: "server",
        message: t(
          isResetPasswordFlow
            ? "auth.otp.missingEmailReset"
            : "auth.otp.missingEmailRegister",
        ),
      });
      return;
    }

    setIsResending(true);
    setResendMessage(null);

    try {
      const response = isResetPasswordFlow
        ? await forgotPassword({ email })
        : await resendVerificationOtp({ email });

      setResendMessage(
        translateServerMessage(response?.message || t("auth.otp.sent"), t),
      );
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;

      setError("root", {
        type: "server",
        message: translateServerMessage(message, t) || t("auth.otp.resendFailed"),
      });
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: VerifyEmailFormData) => {
    const email = getEmailFromContext();

    if (!email) {
      setError("root", {
        type: "server",
        message: t(
          isResetPasswordFlow
            ? "auth.otp.missingEmailReset"
            : "auth.otp.missingEmailRegister",
        ),
      });
      return;
    }

    try {
      const response = isResetPasswordFlow
        ? await verifyResetOtp({ email, otp: data.otp })
        : await verifyEmail({ email, otp: data.otp });

      if (response?.success) {
        if (isResetPasswordFlow) {
          const resetToken = (response as { data?: { resetToken?: string } })?.data
            ?.resetToken;

          if (!resetToken) {
            setError("root", {
              type: "server",
              message: t("auth.otp.tokenMissing"),
            });
            return;
          }

          localStorage.setItem("careerpilot_reset_token", resetToken);
          router.push(
            `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`,
          );
          return;
        }

        router.push("/login");
        return;
      }

      setError("root", {
        type: "server",
        message:
          translateServerMessage(response?.message || "", t) ||
          t("auth.otp.failed"),
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;

      setError("root", {
        type: "server",
        message: translateServerMessage(message, t) || t("auth.otp.invalid"),
      });
    }
  };

  return (
    <AuthCard
      title={t("auth.otp.title")}
      subtitle={t("auth.otp.subtitle")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-6" noValidate>
        {errors.root && (
          <p className="w-full text-center text-xs text-red-500">{errors.root.message}</p>
        )}

        <div className="flex gap-3" dir="ltr">
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={digit}
              maxLength={1}
              onChange={(event) => handleDigitChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              className="h-12 w-11 rounded-xl border-2 border-gray-200 text-center text-lg font-bold transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              aria-invalid={Boolean(errors.otp)}
            />
          ))}
        </div>

        {errors.otp && (
          <p className="text-xs text-red-500">{errors.otp.message}</p>
        )}

        <Btn
          type="submit"
          className="w-full"
          disabled={isSubmitting || otpValue.length < 6}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t("auth.otp.verifying")}
            </>
          ) : (
            t("auth.otp.verify")
          )}
        </Btn>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("auth.otp.notReceived")}{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending || isSubmitting}
            className="font-medium text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400"
          >
            {isResending ? t("auth.otp.sending") : t("auth.otp.resend")}
          </button>
        </p>

        {resendMessage && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            {resendMessage}
          </p>
        )}

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <ArrowLeft size={14} className="rtl-flip" /> {t("auth.otp.backToSignIn")}
        </button>
      </form>
    </AuthCard>
  );
};

export { OTPPageComponent as OTPPage };
export default OTPPageComponent;
