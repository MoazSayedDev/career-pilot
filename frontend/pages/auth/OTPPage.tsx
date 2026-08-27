"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import {
  verifyEmail,
  verifyResetOtp,
} from "../../services/auth/api/auth.service";
import {
  verifyEmailSchema,
  type VerifyEmailFormData,
} from "../../services/auth/schemas/verify-email.schema";

const OTPPageComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = searchParams.get("mode") ?? "verify-email";
  const isResetPasswordFlow = flow === "reset-password";

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

  const onSubmit = async (data: VerifyEmailFormData) => {
    const email =
      searchParams.get("email") ||
      (isResetPasswordFlow
        ? localStorage.getItem("careerpilot_reset_email")
        : localStorage.getItem("careerpilot_verification_email")) ||
      "";

    if (!email) {
      setError("root", {
        type: "server",
        message: isResetPasswordFlow
          ? "Missing email context. Please try again from the password reset flow."
          : "Missing email context. Please try again from the register flow.",
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
              message: "Reset token was not returned. Please try again.",
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
        message: response?.message || "OTP verification failed.",
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;

      setError("root", {
        type: "server",
        message: message || "Invalid OTP. Please try again.",
      });
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle="We sent a 6-digit code to your email address"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-6" noValidate>
        {errors.root && (
          <p className="w-full text-center text-xs text-red-500">{errors.root.message}</p>
        )}

        <div className="flex gap-3">
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
              className="h-12 w-11 rounded-xl border-2 border-gray-200 text-center text-lg font-bold transition-colors focus:border-violet-500 focus:outline-none"
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
              Verifying…
            </>
          ) : (
            "Verify email"
          )}
        </Btn>

        <p className="text-sm text-gray-500">
          Didn&apos;t receive it?{" "}
          <button type="button" className="font-medium text-violet-600 hover:underline">
            Resend code
          </button>
        </p>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={14} /> Back to sign in
        </button>
      </form>
    </AuthCard>
  );
};

export { OTPPageComponent as OTPPage };
export default OTPPageComponent;
