"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { forgotPassword } from "../../services/auth/api/auth.service";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../../services/auth/schemas/forgot-password.schema";

const ForgotPasswordPageComponent = () => {
  const router = useRouter();

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
        message: response?.message || "Unable to send reset instructions.",
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;

      setError("root", {
        type: "server",
        message: message || "Unable to send reset instructions.",
      });
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {errors.root && (
          <p className="text-xs text-red-500">{errors.root.message}</p>
        )}

        <Field label="Email address" error={errors.email?.message}>
          <Input
            {...register("email")}
            placeholder="you@company.com"
            type="email"
            icon={<Mail size={15} />}
            disabled={isSubmitting}
          />
        </Field>

        <Btn type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </Btn>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex items-center justify-center gap-1 text-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </button>
      </form>
    </AuthCard>
  );
};

export { ForgotPasswordPageComponent as ForgotPasswordPage };
export default ForgotPasswordPageComponent;
