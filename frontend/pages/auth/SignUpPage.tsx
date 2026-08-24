import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthCard } from "../../components/ui/AuthCard";
import { GoogleBtn } from "../../components/ui/GoogleBtn";
import { Divider } from "../../components/ui/Divider";
import { Btn } from "../../components/ui/Btn";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import type { Page } from "../../types";

interface SignUpPageProps {
  onNav: (p: Page) => void;
}

export function SignUpPage({ onNav }: SignUpPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.includes("@")) e.email = "Enter a valid email address";
    if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onNav("verify-otp"); }, 1500);
  };

  return (
    <AuthCard title="Create your account" subtitle="Build your AI-powered CV today">
      <GoogleBtn label="Sign up with Google" />
      <Divider label="or sign up with email" />

      <div className="flex flex-col gap-4">
        <Field label="Full name" error={errors.name}>
          <Input value={name} onChange={setName} placeholder="Sarah Johnson" icon={<User size={15} />} />
        </Field>

        <Field label="Email address" error={errors.email}>
          <Input value={email} onChange={setEmail} placeholder="you@company.com" type="email" icon={<Mail size={15} />} />
        </Field>

        <Field label="Password" error={errors.password} hint="Minimum 8 characters">
          <div className="relative">
            <Input
              value={password}
              onChange={setPassword}
              placeholder="Create a strong password"
              type={showPw ? "text" : "password"}
              icon={<Lock size={15} />}
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

        <Field label="Confirm password" error={errors.confirm}>
          <Input
            value={confirm}
            onChange={setConfirm}
            placeholder="Repeat your password"
            type="password"
            icon={<Lock size={15} />}
          />
        </Field>

        <Btn className="w-full" disabled={loading} onClick={handleSubmit}>
          {loading ? (
            <><Loader2 size={16} className="animate-spin" />Creating account…</>
          ) : (
            "Create account"
          )}
        </Btn>

        <p className="text-xs text-center text-gray-400">
          By creating an account you agree to our{" "}
          <a href="#" className="text-violet-600 hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-violet-600 hover:underline">Privacy Policy</a>
        </p>
      </div>

      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{" "}
        <button onClick={() => onNav("signin")} className="text-violet-600 font-medium hover:underline">
          Sign in
        </button>
      </p>
    </AuthCard>
  );
}
