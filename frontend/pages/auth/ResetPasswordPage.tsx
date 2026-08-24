import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import type { Page } from "../../types";

interface ResetPasswordPageProps {
  onNav: (p: Page) => void;
}

export function ResetPasswordPage({ onNav }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <AuthCard title="Reset your password" subtitle="Choose a new password for your account">
      {done ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <p className="text-sm text-gray-600 text-center">Password reset successfully!</p>
          <Btn className="w-full" onClick={() => onNav("signin")}>
            Sign in with new password
          </Btn>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="New password" hint="Minimum 8 characters">
            <div className="relative">
              <Input
                value={password}
                onChange={setPassword}
                placeholder="New password"
                type={showPw ? "text" : "password"}
                icon={<Lock size={15} />}
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

          <Field label="Confirm new password">
            <Input
              value={confirm}
              onChange={setConfirm}
              placeholder="Repeat new password"
              type="password"
              icon={<Lock size={15} />}
            />
          </Field>

          {mismatch && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} />Passwords do not match
            </p>
          )}

          <Btn
            className="w-full"
            disabled={loading || !password || mismatch}
            onClick={() => {
              setLoading(true);
              setTimeout(() => { setLoading(false); setDone(true); }, 1500);
            }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" />Resetting…</>
            ) : (
              "Reset password"
            )}
          </Btn>
        </div>
      )}
    </AuthCard>
  );
}
