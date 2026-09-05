import { Suspense } from "react";

import { SignInPage } from "@/pages/auth/SignInPage";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center font-sans">
      <Suspense>
        <SignInPage />
      </Suspense>
    </div>
  );
}
