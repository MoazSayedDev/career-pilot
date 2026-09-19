"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import { Divider } from "../../components/ui/Divider";
import { Field } from "../../components/ui/Field";
import { GoogleAuthButton } from "../../components/ui/GoogleAuthButton";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { register as registerUser } from "../../services/auth/api/auth.service";
import {
  makeRegisterSchema,
  type RegisterFormData,
} from "../../services/auth/schemas/register.schema";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { translateServerMessage } from "@/lib/server-messages";

const SignUpPageComponent = () => {

  const router = useRouter();
  const { t, locale } = useI18n();
  const [googleError, setGoogleError] = useState<string | null>(null);

  const registerSchema = useMemo(() => makeRegisterSchema(t), [t]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await registerUser(data);

      if (response?.success) {
        localStorage.setItem("careerpilot_verification_email", data.email);
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }

      setError("root", {
        type: "server",
        message:
          translateServerMessage(response?.message || "", t) ||
          t("auth.signUp.unableToCreate"),
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;

      setError("root", {
        type: "server",
        message:
          translateServerMessage(message, t) || t("auth.signUp.unableToCreate"),
      });
    }
  };

  /** Shared error copy for every Google-auth failure mode. */
  const handleGoogleError = (error: string) => {
    const copy: Record<string, string> = {
      popup_blocked: t("auth.google.popupBlocked"),
      timeout: t("auth.google.timeout"),
      cancelled: t("auth.google.cancelled"),
      refresh_failed: t("auth.google.failed"),
    };

    setGoogleError(copy[error] ?? t("auth.google.failed"));
  };

  const handleGoogleSuccess = () => {
    setGoogleError(null);
    router.push("/dashboard");
  };

  return (
    <AuthCard
      title={t("auth.signUp.title")}
      subtitle={t("auth.signUp.subtitle")}
    >
      {/* Google OAuth */}
      <GoogleAuthButton
        mode="signup"
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        disabled={isSubmitting}
      />

      {googleError && (
        <p className="flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle size={14} />
          {googleError}
        </p>
      )}

      <Divider label={t("auth.signUp.orEmail")} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {errors.root && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            {errors.root.message}
          </p>
        )}

        <Field label={t("auth.signUp.fullName")} error={errors.username?.message}>
          <Input
            {...register("username")}
            placeholder={t("auth.signUp.fullNamePlaceholder")}
            icon={<User size={15} />}
            disabled={isSubmitting}
          />
        </Field>

        <Field label={t("auth.signUp.email")} error={errors.email?.message}>
          <Input
            {...register("email")}
            placeholder={t("auth.signUp.emailPlaceholder")}
            type="email"
            icon={<Mail size={15} />}
            disabled={isSubmitting}
          />
        </Field>

        <Field
          label={t("auth.signUp.password")}
          error={errors.password?.message}
          hint={t("auth.signUp.passwordHint")}
        >
          <PasswordInput
            {...register("password")}
            placeholder={t("auth.signUp.passwordPlaceholder")}
            disabled={isSubmitting}
          />
        </Field>

        <Field
          label={t("auth.signUp.confirmPassword")}
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            {...register("confirmPassword")}
            placeholder={t("auth.signUp.confirmPlaceholder")}
            disabled={isSubmitting}
          />
        </Field>

        <Btn type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t("auth.signUp.submitting")}
            </>
          ) : (
            t("auth.signUp.submit")
          )}
        </Btn>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          {t("auth.signUp.termsPrefix")}{" "}
          <a href="/terms" className="text-blue-700 hover:underline dark:text-blue-400">
            {t("auth.signUp.termsOfService")}
          </a>{" "}
          {/* Arabic "و" attaches to the following word */}
          {t("auth.signUp.termsAnd")}
          {locale === "ar" ? "" : " "}
          <a href="/privacy" className="text-blue-700 hover:underline dark:text-blue-400">
            {t("auth.signUp.privacyPolicy")}
          </a>
        </p>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
        {t("auth.signUp.haveAccount")}{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="font-medium text-blue-700 hover:underline dark:text-blue-400"
        >
          {t("auth.signUp.signInLink")}
        </button>
      </p>
    </AuthCard>
  );
};

export { SignUpPageComponent as SignUpPage };
export default SignUpPageComponent;
