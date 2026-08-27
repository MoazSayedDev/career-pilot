"use client";

import { useEffect, useState } from "react";
import { LayoutTemplate, Eye, Download, Check } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";

import {
  createResume,
  getResumes,
  updateResume,
} from "@/services/resume/api/resume.service";
import {
  ResumeTemplate,
  type Resume,
} from "@/services/resume/types/resume";

const TEMPLATE_OPTIONS = [
  { id: ResumeTemplate.MODERN, name: "Modern", description: "Clean, modern layout with strong visual hierarchy", tag: "Popular", accent: "violet" },
  { id: ResumeTemplate.CLASSIC, name: "Classic", description: "Traditional single-column, ATS-friendly structure", tag: "ATS Safe", accent: "gray" },
  { id: ResumeTemplate.MINIMAL, name: "Minimal", description: "Minimal layout with generous whitespace and clarity", tag: "Clean", accent: "slate" },
] as const;

const ACCENT_COLORS: Record<string, string> = {
  violet: "bg-violet-600",
  gray: "bg-gray-700",
  slate: "bg-slate-600",
};

function TemplateMock({ template }: { template: (typeof TEMPLATE_OPTIONS)[number] }) {
  const bg = ACCENT_COLORS[template.accent] || "bg-violet-600";

  return (
    <div className="w-full h-full bg-white p-3 flex flex-col gap-2">
      <div className="flex flex-col flex-1 gap-2">
        <div className={`h-7 rounded-t flex items-center px-2 ${bg}`}>
          <div className="flex flex-col gap-0.5">
            <div className="h-2 bg-white/80 rounded w-20" />
            <div className="h-1 bg-white/40 rounded w-14" />
          </div>
        </div>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-1.5 bg-gray-100 rounded w-full" />
        ))}
        <div className="flex gap-1 mt-auto flex-wrap">
          {[1, 2, 3].map((item) => (
            <div key={item} className={`h-3 w-10 rounded-full opacity-30 ${bg}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(ResumeTemplate.MODERN);
  const [resume, setResume] = useState<Resume | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const resumes = await getResumes();
        const firstResume = resumes[0];
        if (firstResume) {
          setResume(firstResume);
          setSelectedTemplate(firstResume.template || ResumeTemplate.MODERN);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void load();
  }, []);

  const persistTemplate = async () => {
    setSaving(true);
    try {
      if (!resume) {
        const created = await createResume({
          title: "Resume",
          template: selectedTemplate,
          jobDescription: undefined,
          skillIds: [],
          experienceIds: [],
          educationIds: [],
          projectIds: [],
          certificateIds: [],
          languageIds: [],
        });
        setResume(created);
        return;
      }

      const updated = await updateResume(resume.id, { template: selectedTemplate });
      setResume(updated as Resume);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const selected = TEMPLATE_OPTIONS.find((template) => template.id === selectedTemplate) ?? TEMPLATE_OPTIONS[0];

  return (
    <div>
      <PageHeader
        icon={<LayoutTemplate size={24} />}
        title="Templates"
        subtitle="Choose a professional template for your CV"
        tipText="The Modern and Classic templates have the best ATS compatibility."
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <p className="text-sm text-gray-500">{TEMPLATE_OPTIONS.length} templates available</p>
          <p className="text-xs text-gray-400 mt-1">
            Selected: <span className="font-medium text-violet-600">{selected.name}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Btn size="sm" variant="outline" onClick={() => void persistTemplate()} disabled={saving}>
            <Eye size={14} />
            Preview Selected
          </Btn>
          <Btn size="sm" onClick={() => void persistTemplate()} disabled={saving}>
            <Download size={14} />
            {saving ? "Saving..." : "Use & Download"}
          </Btn>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATE_OPTIONS.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${isSelected ? "border-violet-500 shadow-md shadow-violet-100" : "border-gray-200 hover:border-gray-300"}`}
            >
              <div className="h-44 bg-gray-50 relative overflow-hidden">
                <div className="absolute top-3 left-3 z-10">
                  <Badge color="violet">{template.tag}</Badge>
                </div>
                <TemplateMock template={template} />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-gray-900">{template.name}</p>
                  {isSelected && <Check size={15} className="text-violet-600" />}
                </div>
                <p className="text-xs text-gray-500 mt-1">{template.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
