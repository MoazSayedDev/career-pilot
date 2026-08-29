"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wand2,
  Pencil,
  ArrowRight,
  Sparkles,
  Briefcase,
  GraduationCap,
  Zap,
  Award,
  Check,
  Download,
  Eye,
  Layers,
  Target,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Field } from "@/components/ui/Field";
import { cn } from "@/utils";

import { getProfile } from "@/services/profile/api/profile.service";
import type { Profile } from "@/services/profile/types/profile";
import { getExperiences } from "@/services/experience/api/experience.service";
import type { Experience } from "@/services/experience/types/experience";
import { getEducations } from "@/services/education/api/education.service";
import type { Education } from "@/services/education/types/education";
import { getSkills } from "@/services/skill/api/skill.service";
import type { Skill } from "@/services/skill/types/skill";
import { getProjects } from "@/services/project/api/project.service";
import type { Project } from "@/services/project/types/project";
import { getCertificates } from "@/services/certificate/api/certificate.service";
import type { Certificate } from "@/services/certificate/types/certificate";

const ALL_SECTIONS = [
  { id: "personal-info", label: "Personal Info", icon: <Pencil size={14} />, href: "/profile" },
  { id: "experience", label: "Experience", icon: <Briefcase size={14} />, href: "/profile/experience" },
  { id: "education", label: "Education", icon: <GraduationCap size={14} />, href: "/profile/education" },
  { id: "skills", label: "Skills", icon: <Zap size={14} />, href: "/profile/skill" },
  { id: "projects", label: "Projects", icon: <Layers size={14} />, href: "/profile/projects" },
  { id: "certificates", label: "Certificates", icon: <Award size={14} />, href: "/profile/certificates" },
  { id: "ai-summary", label: "Summary", icon: <Sparkles size={14} />, href: "/resume/ai-summary" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [mode, setMode] = useState<null | "ai" | "manual">(null);
  const [aiJobDesc, setAiJobDesc] = useState("");
  const [aiRole, setAiRole] = useState("");
  const [manualSections, setManualSections] = useState<string[]>(["personal-info", "experience", "education", "skills"]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, experiencesData, educationData, skillsData, projectsData, certificatesData] = await Promise.all([
          getProfile().catch(() => null),
          getExperiences().catch(() => []),
          getEducations().catch(() => []),
          getSkills().catch(() => []),
          getProjects().catch(() => []),
          getCertificates().catch(() => []),
        ]);

        setProfile(profileData);
        setExperiences(experiencesData);
        setEducation(educationData);
        setSkills(skillsData);
        setProjects(projectsData);
        setCertificates(certificatesData);
      } catch (error) {
        console.error(error);
      }
    };

    void load();
  }, []);

  const completionSections = useMemo(
    () => [
      { label: "Personal Info", done: Boolean(profile?.firstName && profile?.lastName) },
      { label: "Experience", done: experiences.length > 0 },
      { label: "Education", done: education.length > 0 },
      { label: "Skills", done: skills.length > 0 },
      { label: "Projects", done: projects.length > 0 },
      { label: "Certificates", done: certificates.length > 0 },
    ],
    [profile, experiences, education, skills, projects, certificates],
  );

  const completed = completionSections.filter((section) => section.done).length;
  const pct = Math.round((completed / completionSections.length) * 100);

  const toggleSection = (id: string) => {
    setManualSections((prev) => (prev.includes(id) ? prev.filter((section) => section !== id) : [...prev, id]));
  };

  const handleGenerate = () => {
    router.push("/resume/ai-summary");
  };

  const handleManualStart = () => {
    if (!manualSections.length) return;
    const firstSection = ALL_SECTIONS.find((section) => section.id === manualSections[0]);
    if (firstSection) router.push(firstSection.href);
  };

  const firstName = profile?.firstName || "there";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Your CV is {pct}% complete. Keep going!</p>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Btn size="sm" variant="outline" onClick={() => router.push("/resume/preview")}>
            <Eye size={14} />
            Preview CV
          </Btn>
          <Btn size="sm" onClick={() => router.push("/resume/download")}>
            <Download size={14} />
            Download PDF
          </Btn>
        </div>
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-800">CV Completion</p>
            <p className="text-xs text-gray-400 mt-0.5">{completed} of {completionSections.length} sections filled</p>
          </div>
          <span className="text-2xl font-bold text-violet-600">{pct}%</span>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {completionSections.map((section) => (
            <span key={section.label} className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium", section.done ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500")}>
              {section.done ? <Check size={11} /> : <div className="w-2.5 h-2.5 rounded-full border-2 border-current opacity-40" />}
              {section.label}
            </span>
          ))}
        </div>
      </Card>

      {!mode && (
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <div onClick={() => setMode("ai")} className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl hover:shadow-violet-200 hover:-translate-y-0.5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Wand2 size={22} />
            </div>
            <h3 className="text-xl font-bold mb-2">Generate CV with AI</h3>
            <p className="text-violet-200 text-sm leading-relaxed mb-4">Create a tailored, high-impact CV summary based on your profile and target role.</p>
            <div className="flex items-center gap-2 text-sm font-medium text-violet-100">
              Continue <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <div onClick={() => setMode("manual")} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4 text-violet-600">
              <Pencil size={22} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Build your CV manually</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">Update each section yourself and keep your CV aligned with the latest information.</p>
            <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
              Continue <ArrowRight size={16} />
            </div>
          </div>
        </div>
      )}

      {mode === "ai" && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Target size={16} className="text-violet-500" />
            AI CV Assistant
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Target Role">
              <Input value={aiRole} onChange={setAiRole} placeholder="Senior Frontend Developer" />
            </Field>
            <Field label="Job Description">
              <Textarea value={aiJobDesc} onChange={setAiJobDesc} rows={5} placeholder="Paste the job description here..." />
            </Field>
          </div>
          <div className="flex gap-3 mt-5">
            <Btn onClick={handleGenerate}>
              <Wand2 size={15} />
              Generate Summary
            </Btn>
            <Btn variant="outline" onClick={() => setMode(null)}>Back</Btn>
          </div>
        </Card>
      )}

      {mode === "manual" && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-5">Choose the section to start with</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {ALL_SECTIONS.map((section) => (
              <button key={section.id} type="button" onClick={() => toggleSection(section.id)} className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${manualSections.includes(section.id) ? "border-violet-200 bg-violet-50" : "border-gray-200 bg-white"}`}>
                <div className="flex items-center gap-3 text-gray-700">
                  {section.icon}
                  <span className="font-medium">{section.label}</span>
                </div>
                {manualSections.includes(section.id) ? <Check size={16} className="text-violet-600" /> : <div className="w-4 h-4 rounded-full border border-gray-300" />}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <Btn onClick={handleManualStart} disabled={!manualSections.length}>
              Start editing
            </Btn>
            <Btn variant="outline" onClick={() => setMode(null)}>Back</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}
