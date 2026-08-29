import { Globe } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";

export default function LanguagePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Globe size={24} />}
        title="Languages"
        subtitle="Manage the languages you speak and your proficiency levels."
      />

      <div className="max-w-4xl"></div>
    </div>
  );
}
