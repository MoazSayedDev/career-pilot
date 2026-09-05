"use client";

import axios from "axios";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import { Divider } from "../../components/ui/Divider";
import { Field } from "../../components/ui/Field";
import { GoogleBtn } from "../../components/ui/GoogleBtn";
import { Input } from "../../components/ui/Input";

import { login } from "../../services/auth/api/auth.service";
import {
  makeLoginSchema,
  type LoginFormData,
} from "../../services/auth/schemas/login.schema";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { translateServerMessage } from "@/lib/server-messages";

const SignInPageComponent = () => {
  const router = useRouter();
  const { t } = useI18n();
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  const loginSchema = useMemo(() => makeLoginSchema(t), [t]);

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
      await login(data);

      if (remember) {
        localStorage.setItem("careerpilot_remember_me", "true");
      } else {
        localStorage.removeItem("careerpilot_remember_me");
      }

      router.push("/dashboard");
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

  return (
    <AuthCard
      title={t("auth.signIn.title")}
      subtitle={t("auth.signIn.subtitle")}
    >
      <GoogleBtn label={t("auth.signIn.google")} />

      <Divider label={t("auth.signIn.orEmail")} />

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
          <div className="relative">
            <Input
              {...register("password")}
              placeholder={t("auth.signIn.passwordPlaceholder")}
              type={showPw ? "text" : "password"}
              icon={<Lock size={15} />}
              disabled={isSubmitting}
            />

            <button
              type="button"
              onClick={() => setShowPw((value) => !value)}
              disabled={isSubmitting}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-gray-200"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
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
