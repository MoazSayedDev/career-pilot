"use client";

import axios from "axios";
import { AlertCircle, Mail } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
// Divider between social sign-in and email sign-in is hidden while the
// Google button is hidden (there is nothing to divide).
// import { Divider } from "../../components/ui/Divider";
import { Field } from "../../components/ui/Field";
// Google OAuth temporarily hidden from users until OAuth is reconfigured
// (button + handlers commented out below; proxy plumbing stays active).
// import { GoogleAuthButton } from "../../components/ui/GoogleAuthButton";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";

import { login } from "../../services/auth/api/auth.service";
import {
  makeLoginSchema,
  type LoginFormData,
} from "../../services/auth/schemas/login.schema";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { translateServerMessage } from "@/lib/server-messages";
import { continueGoogleAuthOutcome } from "@/lib/google-auth";

const SignInPageComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [remember, setRemember] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const loginSchema = useMemo(() => makeLoginSchema(t), [t]);

  /** Destination for a successful login (shared by both flows). */
  const redirectAfterLogin = () => {
    // Return the user to the protected page that sent them here, but
    // only allow in-app destinations (open-redirect protection).
    const requested = searchParams?.get("redirect");
    const target =
      requested && requested.startsWith("/") && !requested.startsWith("//")
        ? requested
        : "/dashboard";
    router.push(target);
  };

  /**
   * Return leg of the Google OAuth flow: the callback completion page
   * landed here with `?logged_in=…`. Verify the session for real
   * (`/auth/refresh` + `/auth/me`) and continue to the dashboard — or
   * surface the failure (consent denied, backend down) as a normal
   * login error. Ordinary page loads resolve `null` and do nothing.
   */
  useEffect(() => {
    let cancelled = false;

    void continueGoogleAuthOutcome().then((result) => {
      if (!result || cancelled) return;

      if (result.success) {
        redirectAfterLogin();
        return;
      }

      setGoogleError(t("auth.google.failed"));
    });

    return () => {
      cancelled = true;
    };
    // Runs once per page load; the redirect target is stable here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // "Remember me" controls the refresh-cookie lifetime server-side;
      // unchecked logins end when the browser session ends.
      await login({ ...data, rememberMe: remember });

      // Return the user to the protected page that sent them here, but
      // only allow in-app destinations (open-redirect protection).
      const requested = searchParams?.get("redirect");
      const target =
        requested && requested.startsWith("/") && !requested.startsWith("//")
          ? requested
          : "/dashboard";
      router.push(target);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (typeof message === "string") {
          setError("root", {
            type: "server",
            message: translateServerMessage(message, t),
          });
        } else {
          setError("root", {
            type: "server",
            message: t("auth.signIn.invalidCredentials"),
          });
        }

        return;
      }

      setError("root", {
        type: "server",
        message: t("auth.signIn.genericError"),
      });
    }
  };

  /* Google OAuth temporarily hidden — restored together with the button below.
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
    redirectAfterLogin();
  };
  */

  return (
    <AuthCard
      title={t("auth.signIn.title")}
      subtitle={t("auth.signIn.subtitle")}
    >
      {/* Google OAuth: temporarily hidden from users until OAuth is
          reconfigured for production. The same-origin proxy and the
          ?logged_in= return leg below remain active and safe. */}
      {/*
      <GoogleAuthButton
        mode="signin"
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        disabled={isSubmitting}
      />
      */}

      {googleError && (
        <p className="flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle size={14} />
          {googleError}
        </p>
      )}

      {/* Hidden with the Google button (see above). */}
      {/* <Divider label={t("auth.signIn.orEmail")} /> */}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Server Error */}
        {errors.root && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle size={15} />
            <span>{errors.root.message}</span>
          </div>
        )}

        {/* Email */}
        <Field label={t("auth.signIn.email")}>
          <Input
            {...register("email")}
            placeholder={t("auth.signIn.emailPlaceholder")}
            type="email"
            icon={<Mail size={15} />}
            disabled={isSubmitting}
          />
        </Field>

        {errors.email && (
          <p className="-mt-2 text-sm text-red-500">{errors.email.message}</p>
        )}

        {/* Password */}
        <Field label={t("auth.signIn.password")}>
          <PasswordInput
            {...register("password")}
            placeholder={t("auth.signIn.passwordPlaceholder")}
            disabled={isSubmitting}
          />
        </Field>

        {errors.password && (
          <p className="-mt-2 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}

        {/* Remember + Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            />

            <span className="text-sm text-gray-600 dark:text-gray-300">
              {t("auth.signIn.remember")}
            </span>
          </label>

          <button
            type="button"
            onClick={() => router.push("/forget-password")}
            disabled={isSubmitting}
            className="text-sm text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400"
          >
            {t("auth.signIn.forgot")}
          </button>
        </div>

        {/* Submit */}
        <Btn type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("auth.signIn.submitting") : t("auth.signIn.submit")}
        </Btn>
      </form>

      {/* Register */}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {t("auth.signIn.noAccount")}{" "}
        <button
          type="button"
          onClick={() => router.push("/register")}
          disabled={isSubmitting}
          className="font-medium text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400"
        >
          {t("auth.signIn.createOne")}
        </button>
      </p>
    </AuthCard>
  );
};

export { SignInPageComponent as SignInPage };
export default SignInPageComponent;
