"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wand2,
  Pencil,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Zap,
  Award,
  Check,
  Eye,
  Layers,
  Target,
  Loader2,
} from "lucide-react";

import axios from "axios";
import { useRouter } from "next/navigation";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";

import { getApiErrorMessage } from "@/lib/api-error";
import { useI18n } from "@/lib/i18n/I18nProvider";

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
import { createResumeByJobDescription } from "@/services/resume/api/resume.service";

const SECTION_KEYS = [
  { id: "personal-info", labelKey: "dashboard.section.personalInfo", icon: <Pencil size={14} />, href: "/profile" },
  { id: "experience", labelKey: "dashboard.section.experience", icon: <Briefcase size={14} />, href: "/profile/experience" },
  { id: "education", labelKey: "dashboard.section.education", icon: <GraduationCap size={14} />, href: "/profile/education" },
  { id: "skills", labelKey: "dashboard.section.skills", icon: <Zap size={14} />, href: "/profile/skill" },
  { id: "projects", labelKey: "dashboard.section.projects", icon: <Layers size={14} />, href: "/profile/projects" },
  { id: "certificates", labelKey: "dashboard.section.certificates", icon: <Award size={14} />, href: "/profile/certificates" },
];

/** Mirrors the backend's 4000-character limit on the job description. */
const JOB_DESCRIPTION_MAX_LENGTH = 4000;
const JOB_DESCRIPTION_MIN_LENGTH = 30;

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [mode, setMode] = useState<null | "ai" | "manual">(null);
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
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
      } catch {
        // Completion stats simply stay at zero when loading fails.
      }
    };

    void load();
  }, []);

  const completionSections = useMemo(
    () => [
      { labelKey: "dashboard.section.personalInfo", done: Boolean(profile?.firstName && profile?.lastName) },
      { labelKey: "dashboard.section.experience", done: experiences.length > 0 },
      { labelKey: "dashboard.section.education", done: education.length > 0 },
      { labelKey: "dashboard.section.skills", done: skills.length > 0 },
      { labelKey: "dashboard.section.projects", done: projects.length > 0 },
      { labelKey: "dashboard.section.certificates", done: certificates.length > 0 },
    ],
    [profile, experiences, education, skills, projects, certificates],
  );

  const completed = completionSections.filter((section) => section.done).length;
  const pct = Math.round((completed / completionSections.length) * 100);

  const toggleSection = (id: string) => {
    setManualSections((prev) => (prev.includes(id) ? prev.filter((section) => section !== id) : [...prev, id]));
  };

  const trimmedJobDescription = jobDescription.trim();

  const jobDescriptionError = useMemo(() => {
    if (!trimmedJobDescription) return null;

    if (trimmedJobDescription.length < JOB_DESCRIPTION_MIN_LENGTH) {
      return t("dashboard.aiForm.tooShort");
    }

    return null;
  }, [trimmedJobDescription, t]);

  const canGenerate =
    !generating &&
    trimmedJobDescription.length >= JOB_DESCRIPTION_MIN_LENGTH &&
    trimmedJobDescription.length <= JOB_DESCRIPTION_MAX_LENGTH;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setGenerating(true);
    setGenerateError(null);

    try {
      const result = await createResumeByJobDescription({
        jobDescription: trimmedJobDescription,
      });

      setMode(null);
      setJobDescription("");

      router.push(`/resume/preview?id=${result.id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push("/login");
        return;
      }

      setGenerateError(
        getApiErrorMessage(error, t("dashboard.aiForm.failed")),
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleManualStart = () => {
    if (!manualSections.length) return;
    const firstSection = SECTION_KEYS.find((section) => section.id === manualSections[0]);
    if (firstSection) router.push(firstSection.href);
  };

  const firstName = profile?.firstName || t("dashboard.fallbackName");

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("dashboard.welcome", { name: firstName })}
          </h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">
            {t("dashboard.progressLine", { pct })}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Btn size="sm" variant="outline" onClick={() => router.push("/resume/preview")}>
            <Eye size={14} />
            {t("dashboard.previewCv")}
          </Btn>
        </div>
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{t("dashboard.completion")}</p>
            <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-500">
              {t("dashboard.sectionsFilled", { done: completed, total: completionSections.length })}
            </p>
          </div>
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{pct}%</span>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {completionSections.map((section) => (
            <span key={section.labelKey} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${section.done ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
              {section.done ? <Check size={11} /> : <div className="w-2.5 h-2.5 rounded-full border-2 border-current opacity-40" />}
              {t(section.labelKey)}
            </span>
          ))}
        </div>
      </Card>

      {!mode && (
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <div onClick={() => setMode("ai")} className="bg-gradient-to-br from-[#12264F] to-[#1E40AF] rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 transition-all group dark:hover:shadow-blue-950">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Wand2 size={22} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t("dashboard.aiCard.title")}</h3>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">{t("dashboard.aiCard.desc")}</p>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-100">
              {t("common.continue")} <ArrowRight size={16} className="rtl-flip transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <div onClick={() => setMode("manual")} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <Pencil size={22} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-gray-100">{t("dashboard.manualCard.title")}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 dark:text-gray-400">{t("dashboard.manualCard.desc")}</p>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
              {t("common.continue")} <ArrowRight size={16} className="rtl-flip transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      )}

      {mode === "ai" && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2 dark:text-gray-200">
            <Target size={16} className="text-blue-500" />
            {t("dashboard.aiForm.title")}
          </h3>

          <p className="text-xs text-gray-400 mb-5 dark:text-gray-500">
            {t("dashboard.aiForm.desc")}
          </p>

          <div className="flex flex-col gap-2">
            <label htmlFor="job-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("dashboard.aiForm.label")} <span className="text-red-500">*</span>
            </label>

            <Textarea
              value={jobDescription}
              onChange={(value) => {
                setJobDescription(value);
                if (generateError) setGenerateError(null);
              }}
              placeholder={t("dashboard.aiForm.placeholder")}
              rows={7}
              maxLength={JOB_DESCRIPTION_MAX_LENGTH}
            />

            <p className="text-xs text-gray-400 dark:text-gray-500">
              {jobDescription.length}/{JOB_DESCRIPTION_MAX_LENGTH} {t("common.characters")}
            </p>

            {jobDescriptionError && !generating && (
              <p className="text-xs text-red-500">{jobDescriptionError}</p>
            )}

            {generateError && (
              <p className="text-sm text-red-500">{generateError}</p>
            )}

            <div className="flex gap-3 mt-3">
              <Btn onClick={() => void handleGenerate()} disabled={!canGenerate}>
                {generating ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {t("dashboard.aiForm.generating")}
                  </>
                ) : (
                  <>
                    <Wand2 size={15} />
                    {t("dashboard.aiForm.generate")}
                  </>
                )}
              </Btn>

              <Btn variant="outline" onClick={() => setMode(null)} disabled={generating}>
                {t("common.back")}
              </Btn>
            </div>
          </div>
        </Card>
      )}

      {mode === "manual" && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-5 dark:text-gray-200">{t("dashboard.manualForm.title")}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {SECTION_KEYS.map((section) => (
              <button key={section.id} type="button" onClick={() => toggleSection(section.id)} className={`flex items-center justify-between rounded-xl border p-3 text-start transition dark:text-gray-300 ${manualSections.includes(section.id) ? "border-blue-200 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"}`}>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  {section.icon}
                  <span className="font-medium">{t(section.labelKey)}</span>
                </div>
                {manualSections.includes(section.id) ? <Check size={16} className="text-blue-700 dark:text-blue-400" /> : <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <Btn onClick={handleManualStart} disabled={!manualSections.length}>
              {t("dashboard.manualForm.startEditing")}
            </Btn>
            <Btn variant="outline" onClick={() => setMode(null)}>{t("common.back")}</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}
