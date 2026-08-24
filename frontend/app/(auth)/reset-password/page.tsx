import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { Suspense } from "react";

export default function ResetPassword() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center font-sans">
      <Suspense>
        <ResetPasswordPage />
      </Suspense>
    </div>
  );
}
