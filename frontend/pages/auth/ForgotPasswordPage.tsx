import { useState } from "react";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { AuthCard } from "../../components/ui/AuthCard";
import { Btn } from "../../components/ui/Btn";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import type { Page } from "../../types";

interface ForgotPasswordPageProps {
  onNav: (p: Page) => void;
}

export function ForgotPasswordPage({ onNav }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {sent ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
            <Mail size={32} className="text-violet-500" />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Check <strong>{email}</strong> for a password reset link. It may take a few minutes.
          </p>
          <Btn variant="outline" className="w-full" onClick={() => onNav("signin")}>
            Back to sign in
          </Btn>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Email address">
            <Input
              value={email}
              onChange={setEmail}
              placeholder="you@company.com"
              type="email"
              icon={<Mail size={15} />}
            />
          </Field>

          <Btn className="w-full" disabled={loading || !email} onClick={handleSend}>
            {loading ? (
              <><Loader2 size={16} className="animate-spin" />Sending…</>
            ) : (
              "Send reset link"
            )}
          </Btn>

          <button
            onClick={() => onNav("signin")}
            className="text-sm text-center text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
          >
            <ArrowLeft size={14} />Back to sign in
          </button>
        </div>
      )}
    </AuthCard>
  );
}
