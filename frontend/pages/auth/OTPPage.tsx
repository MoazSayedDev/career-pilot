"use client";
import { useState } from "react";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import type { Page } from "../../types";
import { useRouter } from "next/navigation";

export function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp];
    next[i] = v.slice(-1);
    setOtp(next);
    if (v && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handleVerify = () => {
    if (otp.join("").length < 6) return;
    setLoading(true);
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle="We sent a 6-digit code to your email address"
    >
      {success ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Email verified! Redirecting to your dashboard…
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-3">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
                maxLength={1}
              />
            ))}
          </div>

          <Btn
            className="w-full"
            onClick={handleVerify}
            disabled={loading || otp.join("").length < 6}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify email"
            )}
            onClick={() => onNav("signin")}
          </Btn>

          <p className="text-sm text-gray-500">
            Didn&apos;t receive it?{" "}
            <button className="text-violet-600 font-medium hover:underline">
              Resend code
            </button>
          </p>

          <button
            onClick={() => router.push("/login")}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to sign in
          </button>
        </div>
      )}
    </AuthCard>
  );
}
