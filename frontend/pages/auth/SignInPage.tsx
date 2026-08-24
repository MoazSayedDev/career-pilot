import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { AuthCard } from "../../components/ui/AuthCard";
import { GoogleBtn } from "../../components/ui/GoogleBtn";
import { Divider } from "../../components/ui/Divider";
import { Btn } from "../../components/ui/Btn";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import type { Page } from "../../types";

interface SignInPageProps {
  onNav: (p: Page) => void;
  onLogin: () => void;
}

export function SignInPage({ onNav, onLogin }: SignInPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email) { setError("Email is required"); return; }
    if (!password) { setError("Password is required"); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1500);
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your CareerPilot account">
      <GoogleBtn />
      <Divider label="or sign in with email" />

      <div className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-600">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <Field label="Email address">
          <Input
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
            type="email"
            icon={<Mail size={15} />}
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <Input
              value={password}
              onChange={setPassword}
              placeholder="Your password"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <button
            onClick={() => onNav("forgot-password")}
            className="text-sm text-violet-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Btn className="w-full" disabled={loading} onClick={handleSubmit}>
          {loading ? (
            <><Loader2 size={16} className="animate-spin" />Signing in…</>
          ) : (
            "Sign in"
          )}
        </Btn>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <button
          onClick={() => onNav("signup")}
          className="text-violet-600 font-medium hover:underline"
        >
          Create one
        </button>
      </p>
    </AuthCard>
  );
}
