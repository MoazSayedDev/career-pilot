"use client";

import axios from "axios";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  loginSchema,
  type LoginFormData,
} from "../../services/auth/schemas/login.schema";

const SignInPageComponent = () => {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

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
            message,
          });
        } else {
          setError("root", {
            type: "server",
            message: "Invalid email or password.",
          });
        }

        return;
      }

      setError("root", {
        type: "server",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your CareerPilot account"
    >
      <GoogleBtn />

      <Divider label="or sign in with email" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Server Error */}
        {errors.root && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            <AlertCircle size={15} />
            <span>{errors.root.message}</span>
          </div>
        )}

        {/* Email */}
        <Field label="Email address">
          <Input
            {...register("email")}
            placeholder="you@company.com"
            type="email"
            icon={<Mail size={15} />}
            disabled={isSubmitting}
          />
        </Field>

        {errors.email && (
          <p className="-mt-2 text-sm text-red-500">{errors.email.message}</p>
        )}

        {/* Password */}
        <Field label="Password">
          <div className="relative">
            <Input
              {...register("password")}
              placeholder="Your password"
              type={showPw ? "text" : "password"}
              icon={<Lock size={15} />}
              disabled={isSubmitting}
            />

            <button
              type="button"
              onClick={() => setShowPw((value) => !value)}
              disabled={isSubmitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />

            <span className="text-sm text-gray-600">Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => router.push("/forget-password")}
            disabled={isSubmitting}
            className="text-sm text-violet-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <Btn type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Btn>
      </form>

      {/* Register */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/register")}
          disabled={isSubmitting}
          className="font-medium text-violet-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create one
        </button>
      </p>
    </AuthCard>
  );
};

export { SignInPageComponent as SignInPage };
export default SignInPageComponent;
