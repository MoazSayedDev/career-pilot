"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Check,
  FileCheck2,
  FolderOpen,
  Globe,
  GraduationCap,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/utils";

type Step = "choice" | "section-picker" | "job-form" | "analyzing" | "result";

type ResumeSection = {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
};

const MOCK_SKILLS = ["JavaScript", "React", "TypeScript", "Node.js"];
const MOCK_KEYWORDS = ["REST API", "Git", "Agile", "Backend"];

const RESUME_SECTIONS: ResumeSection[] = [
  {
    id: "skills",
    label: "Skills",
    description: "Highlight the technical and soft skills relevant to your target role.",
    icon: <Zap size={16} />,
  },
  {
    id: "experience",
    label: "Experience",
    description: "Include recent roles and measurable impact from your work history.",
    icon: <BriefcaseBusiness size={16} />,
  },
  {
    id: "education",
    label: "Education",
    description: "Add your degrees, certifications, and academic background.",
    icon: <GraduationCap size={16} />,
  },
  {
    id: "projects",
    label: "Projects",
    description: "Showcase case studies, prototypes, and portfolio work.",
    icon: <FolderOpen size={16} />,
  },
  {
    id: "certificates",
    label: "Certificates",
    description: "Add professional certificates and credentials.",
    icon: <Award size={16} />,
  },
  {
    id: "languages",
    label: "Languages",
    description: "Include spoken or written languages that strengthen your profile.",
    icon: <Globe size={16} />,
  },
];

function ResumeCreationOption({
  title,
  description,
  features,
  buttonLabel,
  icon,
  onClick,
  variant = "manual",
}: {
  title: string;
  description: string;
  features: string[];
  buttonLabel: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: "manual" | "ai";
}) {
  const cardClassName =
    variant === "ai" ? "border-violet-200 bg-violet-50/60" : "border-gray-200 bg-white";

  return (
    <Card className={cn("p-5 md:p-6 h-full", cardClassName)}>
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          variant === "ai" ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-600",
        )}
      >
        {icon}
      </div>

      <h2 className="mt-4 text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>

      <ul className="mt-5 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
            <span
              className={cn(
                "mt-1.5 inline-block h-1.5 w-1.5 rounded-full",
                variant === "ai" ? "bg-violet-500" : "bg-violet-400",
              )}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex">
        <Btn
          onClick={onClick}
          variant={variant === "ai" ? "primary" : "outline"}
          className="w-full justify-center"
        >
          {buttonLabel}
          {variant === "manual" ? <ArrowRight size={16} /> : <Sparkles size={15} />}
        </Btn>
      </div>
    </Card>
  );
}

function SectionPicker({
  selectedSections,
  onToggle,
  onContinue,
  onBack,
}: {
  selectedSections: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Choose what to include in your CV</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Select the sections you want CareerPilot to include in your resume.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {RESUME_SECTIONS.map((section) => {
          const isSelected = selectedSections.includes(section.id);

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onToggle(section.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                isSelected
                  ? "border-violet-200 bg-violet-50 text-violet-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg",
                  isSelected ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-500",
                )}
              >
                {section.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-gray-900">{section.label}</p>
                  {isSelected ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white">
                      <Check size={12} />
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full border border-gray-300" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{section.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Selected sections</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedSections.length === 0 ? (
            <span className="text-sm text-gray-400">No sections selected yet.</span>
          ) : (
            selectedSections.map((sectionId) => {
              const section = RESUME_SECTIONS.find((item) => item.id === sectionId);
              return section ? (
                <span
                  key={sectionId}
                  className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
                >
                  {section.label}
                </span>
              ) : null;
            })
          )}
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Btn variant="outline" onClick={onBack}>
          Back
        </Btn>
        <Btn onClick={onContinue} disabled={selectedSections.length === 0}>
          Continue to Resume Builder
        </Btn>
      </div>
    </Card>
  );
}

function JobDescriptionForm({
  value,
  onChange,
  onAnalyze,
  onBack,
}: {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Paste the Job Description</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          CareerPilot will analyze the job description and help you create a resume tailored to this position.
        </p>
      </div>

      <Textarea
        value={value}
        onChange={onChange}
        rows={11}
        placeholder="Paste the job description here..."
      />

      <div className="mt-3 flex justify-end">
        <p className="text-xs text-gray-400">{value.length.toLocaleString()} / 10,000 characters</p>
      </div>

      <div className="mt-7">
        <h3 className="text-sm font-semibold text-gray-800">What CareerPilot will analyze</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Card className="border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800">Required Skills</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Identify technical and soft skills required for the position.
            </p>
          </Card>

          <Card className="border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800">Experience</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Understand the experience and qualifications expected.
            </p>
          </Card>

          <Card className="border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800">Keywords</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Extract important ATS keywords from the job description.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Btn variant="outline" onClick={onBack}>
          Back
        </Btn>
        <Btn onClick={onAnalyze} disabled={!value.trim()}>
          Analyze Job Description <Sparkles size={15} />
        </Btn>
      </div>
    </Card>
  );
}

function AnalysisProgress() {
  const steps = [
    { label: "Reading job description", state: "done" },
    { label: "Identifying required skills", state: "done" },
    { label: "Matching your experience", state: "active" },
    { label: "Optimizing resume", state: "pending" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Analyzing Job Description</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          CareerPilot is identifying the skills, experience, and keywords required for this role.
        </p>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-600">
          <Wand2 size={20} className="animate-pulse" />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3 text-sm text-gray-700">
            {step.state === "done" ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check size={12} />
              </span>
            ) : step.state === "active" ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-600" />
              </span>
            ) : (
              <span className="h-5 w-5 rounded-full border border-gray-300 bg-gray-100" />
            )}
            <span className={cn(step.state === "pending" && "text-gray-400")}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobDescriptionResult({ onCreateResume }: { onCreateResume: () => void }) {
  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Resume Strategy</h2>
          <p className="text-sm text-gray-500">Here&apos;s what we found in this job description.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOCK_SKILLS.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">Experience Requirements</h3>
          <p className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            2+ years of software development experience
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">Important Keywords</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOCK_KEYWORDS.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Btn onClick={onCreateResume}>
          Create Tailored Resume <ArrowRight size={16} />
        </Btn>
      </div>
    </Card>
  );
}

export default function ResumePage() {
  const [step, setStep] = useState<Step>("choice");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "skills",
    "experience",
    "education",
  ]);
  const analysisTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        window.clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);

  const toggleSection = (id: string) => {
    setSelectedSections((current) =>
      current.includes(id) ? current.filter((sectionId) => sectionId !== id) : [...current, id],
    );
  };

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;

    if (analysisTimeoutRef.current) {
      window.clearTimeout(analysisTimeoutRef.current);
    }

    setStep("analyzing");
    analysisTimeoutRef.current = window.setTimeout(() => {
      setStep("result");
    }, 1400);
  };

  const handleCreateTailoredResume = () => {
    setStep("section-picker");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        icon={<FileCheck2 size={24} />}
        title="Resume"
        subtitle="Build and manage the final resume your CV will use."
      />

      {step === "choice" && (
        <div className="grid gap-5 md:grid-cols-2">
          <ResumeCreationOption
            title="Build Your Resume"
            description="Create your resume step by step by choosing the information you want to include."
            features={[
              "Choose your skills",
              "Add your experience",
              "Add your education",
              "Add projects and certifications",
              "Customize your resume",
            ]}
            buttonLabel="Start Building"
            icon={<Target size={18} />}
            onClick={() => setStep("section-picker")}
            variant="manual"
          />

          <ResumeCreationOption
            title="Build Resume from Job Description"
            description="Paste a job description and let CareerPilot tailor your resume to match the role."
            features={[
              "Analyze the job description",
              "Identify required skills",
              "Match your experience",
              "Optimize your resume for the role",
              "Improve ATS compatibility",
            ]}
            buttonLabel="Build from Job Description"
            icon={<Sparkles size={18} />}
            onClick={() => setStep("job-form")}
            variant="ai"
          />
        </div>
      )}

      {step === "section-picker" && (
        <SectionPicker
          selectedSections={selectedSections}
          onToggle={toggleSection}
          onContinue={() => setStep("choice")}
          onBack={() => setStep("choice")}
        />
      )}

      {step === "job-form" && (
        <JobDescriptionForm
          value={jobDescription}
          onChange={setJobDescription}
          onAnalyze={handleAnalyze}
          onBack={() => setStep("choice")}
        />
      )}

      {step === "analyzing" && (
        <Card className="p-6 md:p-8">
          <AnalysisProgress />
        </Card>
      )}

      {step === "result" && (
        <JobDescriptionResult onCreateResume={handleCreateTailoredResume} />
      )}
    </div>
  );
}
