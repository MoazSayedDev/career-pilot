import { Suspense } from "react";
import { OTPPage } from "@/pages/auth/OTPPage";

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center font-sans">
      <Suspense>
        <OTPPage />
      </Suspense>
    </div>
  );
}
