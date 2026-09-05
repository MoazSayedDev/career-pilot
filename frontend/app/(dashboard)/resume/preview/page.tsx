import { Suspense } from "react";

import ResumePreviewPage from "@/pages/app/ResumePreviewPage";

export default function ResumePreviewRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
          Loading preview...
        </div>
      }
    >
      <ResumePreviewPage />
    </Suspense>
  );
}
