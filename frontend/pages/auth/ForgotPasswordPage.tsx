"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { forgotPassword } from "../../services/auth/api/auth.service";
import {
  makeForgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../../services/auth/schemas/forgot-password.schema";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { translateServerMessage } from "@/lib/server-messages";

const ForgotPasswordPageComponent = () => {
  const router = useRouter();
  const { t } = useI18n();

  const forgotPasswordSchema = useMemo(
    () => makeForgotPasswordSchema(t),
    [t],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await forgotPassword(data);

      if (response?.success) {
        localStorage.setItem("careerpilot_reset_email", data.email);
        router.push(
          `/verify-email?email=${encodeURIComponent(data.email)}&mode=reset-password`,
        );
        return;
      }

      setError("root", {
        type: "server",
        message:
          translateServerMessage(response?.message || "", t) ||
          t("auth.forgot.unableToSend"),
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;

      setError("root", {
        type: "server",
        message:
          translateServerMessage(message, t) || t("auth.forgot.unableToSend"),
      });
    }
  };

  return (
    <AuthCard
      title={t("auth.forgot.title")}
      subtitle={t("auth.forgot.subtitle")}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {errors.root && (
          <p className="text-xs text-red-500">{errors.root.message}</p>
        )}

        <Field label={t("auth.forgot.email")} error={errors.email?.message}>
          <Input
            {...register("email")}
            placeholder={t("auth.forgot.emailPlaceholder")}
            type="email"
            icon={<Mail size={15} />}
            disabled={isSubmitting}
          />
        </Field>

        <Btn type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t("auth.forgot.submitting")}
            </>
          ) : (
            t("auth.forgot.submit")
          )}
        </Btn>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex items-center justify-center gap-1 text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft size={14} className="rtl-flip" />
          {t("auth.forgot.backToSignIn")}
        </button>
      </form>
    </AuthCard>
  );
};

export { ForgotPasswordPageComponent as ForgotPasswordPage };
export default ForgotPasswordPageComponent;
