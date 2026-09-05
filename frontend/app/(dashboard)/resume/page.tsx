"use client";

import { useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Briefcase,
  Check,
  ChevronDown,
  Eye,
  FileText,
  FolderGit2,
  GraduationCap,
  Languages,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";

import { createResume } from "@/services/resume/api/resume.service";
import { getProfile } from "@/services/profile/api/profile.service";

import type { CreateResumeDto } from "@/services/resume/types/resume";
import type { ProfileResponse } from "@/services/profile/types/profile";
import { useI18n } from "@/lib/i18n/I18nProvider";

type SectionKey =
  | "skills"
  | "experience"
  | "education"
  | "certificates"
  | "projects"
  | "languages";

export default function StartBuildingPage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("MODERN");

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedEducations, setSelectedEducations] = useState<string[]>([]);
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>(
    [],
  );
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const [openSections, setOpenSections] = useState<SectionKey[]>([
    "skills",
    "experience",
    "education",
    "certificates",
    "projects",
    "languages",
  ]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // One request only
        const data = await getProfile();

        setProfile(data);

        // Select everything by default
        setSelectedSkills(data.skills?.map((item) => item.id) ?? []);

        setSelectedExperiences(
          data.experiences?.map((item) => item.id) ?? [],
        );

        setSelectedEducations(
          data.educations?.map((item) => item.id) ?? [],
        );

        setSelectedCertificates(
          data.certificates?.map((item) => item.id) ?? [],
        );

        setSelectedProjects(
          data.projects?.map((item) => item.id) ?? [],
        );

        setSelectedLanguages(
          data.languages?.map((item) => item.id) ?? [],
        );
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(t("resume.build.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleItem = (
    id: string,
    setSelected: Dispatch<SetStateAction<string[]>>,
  ) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  const toggleSection = (section: SectionKey) => {
    setOpenSections((current) =>
      current.includes(section)
        ? current.filter((item) => item !== section)
        : [...current, section],
    );
  };

  const selectedCount =
    selectedSkills.length +
    selectedExperiences.length +
    selectedEducations.length +
    selectedCertificates.length +
    selectedProjects.length +
    selectedLanguages.length;

  const handleCreateResume = async () => {
    // Validate title
    if (!title.trim()) {
      setError(t("resume.build.titleRequired"));
      return;
    }

    // Validate selected items
    if (selectedCount === 0) {
      setError(t("resume.build.selectRequired"));
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const payload: CreateResumeDto = {
        title: title.trim(),
        template,

        skillIds: selectedSkills,
        experienceIds: selectedExperiences,
        educationIds: selectedEducations,
        certificateIds: selectedCertificates,
        projectIds: selectedProjects,
        languageIds: selectedLanguages,
      };

      const resume = await createResume(payload);

      router.push(`/resume/preview?id=${resume.id}`);
    } catch {
      setError(t("resume.build.createFailed"));
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span>{t("resume.build.loadingProfile")}</span>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <div className="text-center">
          <FileText size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("resume.build.profileError")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            <Sparkles size={22} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("resume.build.title")}
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {t("resume.build.subtitle")}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Resume Details */}
        <Card className="mb-5 p-5">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {t("resume.build.details")}
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("resume.build.detailsHint")}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Resume Title */}
            <div>
              <label
                htmlFor="resume-title"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("resume.build.resumeTitle")}
              </label>

              <input
                id="resume-title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);

                  if (error) {
                    setError(null);
                  }
                }}
                placeholder={t("resume.build.titlePlaceholder")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
              />
            </div>

            {/* Template */}
            <div>
              <label
                htmlFor="resume-template"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("resume.build.template")}
              </label>

              <select
                id="resume-template"
                value={template}
                onChange={(event) => setTemplate(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="MODERN">{t("resume.build.templateModern")}</option>
                <option value="CLASSIC">{t("resume.build.templateClassic")}</option>
                <option value="MINIMAL">{t("resume.build.templateMinimal")}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Skills */}
        <SelectionSection
          icon={<Sparkles size={18} />}
          title={t("resume.build.skills")}
          description={t("resume.build.selectHint.skills")}
          open={openSections.includes("skills")}
          onToggle={() => toggleSection("skills")}
          selectedCount={selectedSkills.length}
          totalCount={profile.skills.length}
          onSelectAll={() =>
            setSelectedSkills((current) =>
              current.length === profile.skills.length
                ? []
                : profile.skills.map((item) => item.id),
            )
          }
          allSelected={
            profile.skills.length > 0 &&
            selectedSkills.length === profile.skills.length
          }
        >
          {profile.skills.length === 0 ? (
            <EmptyState text={t("resume.build.empty.skills")} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.skills.map((skill) => (
                <SelectableCard
                  key={skill.id}
                  selected={selectedSkills.includes(skill.id)}
                  onClick={() => toggleItem(skill.id, setSelectedSkills)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {skill.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t(`skillLevel.${skill.level}`)}

                      {skill.yearsOfExperience
                        ? ` • ${
                            skill.yearsOfExperience === 1
                              ? t("resume.build.yearsOne", {
                                  count: skill.yearsOfExperience,
                                })
                              : t("resume.build.yearsMany", {
                                  count: skill.yearsOfExperience,
                                })
                          }`
                        : ""}
                    </p>
                  </div>
                </SelectableCard>
              ))}
            </div>
          )}
        </SelectionSection>

        {/* Experience */}
        <SelectionSection
          icon={<Briefcase size={18} />}
          title={t("resume.build.experience")}
          description={t("resume.build.selectHint.experience")}
          open={openSections.includes("experience")}
          onToggle={() => toggleSection("experience")}
          selectedCount={selectedExperiences.length}
          totalCount={profile.experiences.length}
          onSelectAll={() =>
            setSelectedExperiences((current) =>
              current.length === profile.experiences.length
                ? []
                : profile.experiences.map((item) => item.id),
            )
          }
          allSelected={
            profile.experiences.length > 0 &&
            selectedExperiences.length === profile.experiences.length
          }
        >
          {profile.experiences.length === 0 ? (
            <EmptyState text={t("resume.build.empty.experience")} />
          ) : (
            <div className="space-y-3">
              {profile.experiences.map((experience) => (
                <SelectableCard
                  key={experience.id}
                  selected={selectedExperiences.includes(experience.id)}
                  onClick={() =>
                    toggleItem(experience.id, setSelectedExperiences)
                  }
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {experience.position}
                    </p>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {experience.company}

                      {experience.location ? ` • ${experience.location}` : ""}
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(experience.startDate, locale)} —{" "}
                      {experience.currentlyWorking
                        ? t("common.present")
                        : formatDate(
                            experience.endDate,
                            locale,
                            t("common.present"),
                          )}
                    </p>

                    {experience.technologies?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {experience.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-md bg-gray-100 px-2 py-1 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </SelectableCard>
              ))}
            </div>
          )}
        </SelectionSection>

        {/* Education */}
        <SelectionSection
          icon={<GraduationCap size={18} />}
          title={t("resume.build.education")}
          description={t("resume.build.selectHint.education")}
          open={openSections.includes("education")}
          onToggle={() => toggleSection("education")}
          selectedCount={selectedEducations.length}
          totalCount={profile.educations.length}
          onSelectAll={() =>
            setSelectedEducations((current) =>
              current.length === profile.educations.length
                ? []
                : profile.educations.map((item) => item.id),
            )
          }
          allSelected={
            profile.educations.length > 0 &&
            selectedEducations.length === profile.educations.length
          }
        >
          {profile.educations.length === 0 ? (
            <EmptyState text={t("resume.build.empty.education")} />
          ) : (
            <div className="space-y-3">
              {profile.educations.map((education) => (
                <SelectableCard
                  key={education.id}
                  selected={selectedEducations.includes(education.id)}
                  onClick={() =>
                    toggleItem(education.id, setSelectedEducations)
                  }
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {education.degree}
                    </p>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {education.university}
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {education.field}
                    </p>

                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(education.startDate, locale)} —{" "}
                      {formatDate(
                        education.endDate,
                        locale,
                        t("common.present"),
                      )}
                    </p>
                  </div>
                </SelectableCard>
              ))}
            </div>
          )}
        </SelectionSection>

        {/* Certificates */}
        <SelectionSection
          icon={<Award size={18} />}
          title={t("resume.build.certificates")}
          description={t("resume.build.selectHint.certificates")}
          open={openSections.includes("certificates")}
          onToggle={() => toggleSection("certificates")}
          selectedCount={selectedCertificates.length}
          totalCount={profile.certificates.length}
          onSelectAll={() =>
            setSelectedCertificates((current) =>
              current.length === profile.certificates.length
                ? []
                : profile.certificates.map((item) => item.id),
            )
          }
          allSelected={
            profile.certificates.length > 0 &&
            selectedCertificates.length === profile.certificates.length
          }
        >
          {profile.certificates.length === 0 ? (
            <EmptyState text={t("resume.build.empty.certificates")} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.certificates.map((certificate) => (
                <SelectableCard
                  key={certificate.id}
                  selected={selectedCertificates.includes(certificate.id)}
                  onClick={() =>
                    toggleItem(certificate.id, setSelectedCertificates)
                  }
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {certificate.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {certificate.issuer}
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t("resume.build.issued", {
                        date: formatDate(certificate.issueDate, locale),
                      })}
                    </p>
                  </div>
                </SelectableCard>
              ))}
            </div>
          )}
        </SelectionSection>

        {/* Projects */}
        <SelectionSection
          icon={<FolderGit2 size={18} />}
          title={t("resume.build.projects")}
          description={t("resume.build.selectHint.projects")}
          open={openSections.includes("projects")}
          onToggle={() => toggleSection("projects")}
          selectedCount={selectedProjects.length}
          totalCount={profile.projects.length}
          onSelectAll={() =>
            setSelectedProjects((current) =>
              current.length === profile.projects.length
                ? []
                : profile.projects.map((item) => item.id),
            )
          }
          allSelected={
            profile.projects.length > 0 &&
            selectedProjects.length === profile.projects.length
          }
        >
          {profile.projects.length === 0 ? (
            <EmptyState text={t("resume.build.empty.projects")} />
          ) : (
            <div className="space-y-3">
              {profile.projects.map((project) => (
                <SelectableCard
                  key={project.id}
                  selected={selectedProjects.includes(project.id)}
                  onClick={() => toggleItem(project.id, setSelectedProjects)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {project.name}
                    </p>

                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {project.description}
                    </p>

                    {project.technologies?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {project.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-md bg-gray-100 px-2 py-1 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </SelectableCard>
              ))}
            </div>
          )}
        </SelectionSection>

        {/* Languages */}
        <SelectionSection
          icon={<Languages size={18} />}
          title={t("resume.build.languages")}
          description={t("resume.build.selectHint.languages")}
          open={openSections.includes("languages")}
          onToggle={() => toggleSection("languages")}
          selectedCount={selectedLanguages.length}
          totalCount={profile.languages.length}
          onSelectAll={() =>
            setSelectedLanguages((current) =>
              current.length === profile.languages.length
                ? []
                : profile.languages.map((item) => item.id),
            )
          }
          allSelected={
            profile.languages.length > 0 &&
            selectedLanguages.length === profile.languages.length
          }
        >
          {profile.languages.length === 0 ? (
            <EmptyState text={t("resume.build.empty.languages")} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.languages.map((language) => (
                <SelectableCard
                  key={language.id}
                  selected={selectedLanguages.includes(language.id)}
                  onClick={() => toggleItem(language.id, setSelectedLanguages)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {language.language}
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {language.level
                        ? t(`languageLevel.${language.level}`)
                        : ""}
                    </p>
                  </div>
                </SelectableCard>
              ))}
            </div>
          )}
        </SelectionSection>

        {/* Bottom Action */}
        <Card className="sticky bottom-4 mt-6 p-4 shadow-lg dark:shadow-black/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {t("resume.build.selectedCount", { count: selectedCount })}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("resume.build.selectedHint")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Btn
                variant="outline"
                onClick={handleCreateResume}
                disabled={creating}
              >
                <Eye size={16} />
                {t("resume.build.preview")}
              </Btn>

              <Btn onClick={handleCreateResume} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t("resume.build.creating")}
                  </>
                ) : (
                  <>
                    {t("resume.build.create")}
                    <Plus size={16} />
                  </>
                )}
              </Btn>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

function SelectionSection({
  icon,
  title,
  description,
  open,
  onToggle,
  selectedCount,
  totalCount,
  onSelectAll,
  allSelected,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  allSelected: boolean;
  children: ReactNode;
}) {
  const { t } = useI18n();

  return (
    <Card className="mb-5 overflow-hidden">
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-start"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            {icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>

              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {selectedCount}/{totalCount}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform dark:text-gray-500 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-gray-800">
          {totalCount > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={onSelectAll}
                className="text-xs font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {allSelected ? t("common.removeAll") : t("common.selectAll")}
              </button>
            </div>
          )}

          {children}
        </div>
      )}
    </Card>
  );
}

function SelectableCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-start transition-colors ${
        selected
          ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
          : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          selected
            ? "border-blue-700 bg-blue-700 text-white dark:border-blue-500 dark:bg-blue-500"
            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
        }`}
      >
        {selected && <Check size={13} />}
      </span>

      {children}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/60">
      <FileText size={24} className="mx-auto text-gray-300 dark:text-gray-600" />

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{text}</p>
    </div>
  );
}

function formatDate(
  date: string | null | undefined,
  locale: string,
  presentLabel = "",
): string {
  if (!date) return presentLabel;

  return new Date(date).toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    month: "short",
    year: "numeric",
  });
}
