"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import { Divider } from "../../components/ui/Divider";
import { Field } from "../../components/ui/Field";
import { GoogleBtn } from "../../components/ui/GoogleBtn";
import { Input } from "../../components/ui/Input";
import { register as registerUser } from "../../services/auth/api/auth.service";
import {
  registerSchema,
  type RegisterFormData,
} from "../../services/auth/schemas/register.schema";

const SignUpPageComponent = () => {
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

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
        message: response?.message || "Unable to create your account.",
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;

      setError("root", {
        type: "server",
        message: message || "Unable to create your account.",
      });
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Build your AI-powered CV today"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <GoogleBtn label="Sign up with Google" />
        <Divider label="or sign up with email" />

        {errors.root && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            {errors.root.message}
          </p>
        )}

        <Field label="Full name" error={errors.username?.message}>
          <Input
            {...register("username")}
            placeholder="Sarah Johnson"
            icon={<User size={15} />}
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Email address" error={errors.email?.message}>
          <Input
            {...register("email")}
            placeholder="you@company.com"
            type="email"
            icon={<Mail size={15} />}
            disabled={isSubmitting}
          />
        </Field>

        <Field
          label="Password"
          error={errors.password?.message}
          hint="Minimum 8 characters"
        >
          <div className="relative">
            <Input
              {...register("password")}
              placeholder="Create a strong password"
              type={showPw ? "text" : "password"}
              icon={<Lock size={15} />}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <Input
            {...register("confirmPassword")}
            placeholder="Repeat your password"
            type="password"
            icon={<Lock size={15} />}
            disabled={isSubmitting}
          />
        </Field>

        <Btn type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Btn>

        <p className="text-center text-xs text-gray-400">
          By creating an account you agree to our{" "}
          <a href="#" className="text-violet-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-violet-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="font-medium text-violet-600 hover:underline"
        >
          Sign in
        </button>
      </p>
    </AuthCard>
  );
};

export { SignUpPageComponent as SignUpPage };
export default SignUpPageComponent;
