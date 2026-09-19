import { Suspense } from "react";

import ResumeByJobDescriptionPage from "@/pages/app/ResumeByJobDescriptionPage";

export default function ResumeByJobDescriptionRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
          Loading...
        </div>
      }
    >
      <ResumeByJobDescriptionPage />
    </Suspense>
  );
}
