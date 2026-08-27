import { FileCheck2 } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import ResumeForm from "@/services/resume/components/ResumeForm";

export default function ResumePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileCheck2 size={24} />}
        title="Resume"
        subtitle="Build and manage the final resume your CV will use."
      />

      <div className="max-w-6xl">
        <ResumeForm />
      </div>
    </div>
  );
}
