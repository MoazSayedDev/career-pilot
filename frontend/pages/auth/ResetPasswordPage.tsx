"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { resetPassword } from "../../services/auth/api/auth.service";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../../services/auth/schemas/reset-password.schema";

const ResetPasswordPageComponent = () => {
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const email =
      new URLSearchParams(window.location.search).get("email") ||
      localStorage.getItem("careerpilot_reset_email") ||
      "";
    const resetToken =
      new URLSearchParams(window.location.search).get("token") ||
      localStorage.getItem("careerpilot_reset_token") ||
      "";

    if (!email || !resetToken) {
      setError("root", {
        type: "server",
        message: "Missing reset session. Please request a new password reset.",
      });
      return;
    }

    try {
      const response = await resetPassword({
        email,
        resetToken,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response?.success) {
        setDone(true);
        return;
      }

      setError("root", {
        type: "server",
        message: response?.message || "Unable to reset your password.",
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;

      setError("root", {
        type: "server",
        message: message || "Unable to reset your password.",
      });
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Choose a new password for your account"
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <p className="text-center text-sm text-gray-600">
            Password reset successfully!
          </p>
          <Btn type="button" className="w-full" onClick={() => router.push("/login")}>
            Sign in with new password
          </Btn>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {errors.root && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={12} />
              {errors.root.message}
            </p>
          )}

          <Field
            label="New password"
            error={errors.password?.message}
            hint="Minimum 8 characters"
          >
            <div className="relative">
              <Input
                {...register("password")}
                placeholder="New password"
                type={showPw ? "text" : "password"}
                icon={<Lock size={15} />}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          <Field label="Confirm new password" error={errors.confirmPassword?.message}>
            <Input
              {...register("confirmPassword")}
              placeholder="Repeat new password"
              type={showPw ? "text" : "password"}
              icon={<Lock size={15} />}
              disabled={isSubmitting}
            />
          </Field>

          <Btn type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Resetting…
              </>
            ) : (
              "Reset password"
            )}
          </Btn>
        </form>
      )}
    </AuthCard>
  );
};

export { ResetPasswordPageComponent as ResetPasswordPage };
export default ResetPasswordPageComponent;
