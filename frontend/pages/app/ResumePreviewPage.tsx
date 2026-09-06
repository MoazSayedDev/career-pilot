"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileDown,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

import { getApiErrorMessage } from "@/lib/api-error";
import { findCvTemplate } from "@/lib/cv-templates";
import { useI18n } from "@/lib/i18n/I18nProvider";

import { getProfile } from "@/services/profile/api/profile.service";
import type { ProfileResponse } from "@/services/profile/types/profile";
import {
  downloadResumePdf,
  getResume,
  getResumes,
} from "@/services/resume/api/resume.service";
import type { Resume } from "@/services/resume/types/resume";

/**
 * Mirrors formatDate in the backend PDF mapper:
 * ISO date -> "Jan 2024", empty string when missing/invalid.
 */
function formatDate(dateStr: string | null | undefined, locale: string): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Mirrors formatEmploymentType in the backend PDF mapper:
 * "FULL_TIME" -> "Full Time" (or the localized employment-type label).
 */
function formatEnum(
  value: string | null | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (!value) return "";

  const key = `employmentType.${value}`;

  const localized = t(key);

  // Unknown enum values are not in the dictionary; fall back to
  // "Full Time"-style title casing like the backend PDF mapper.
  if (localized === key) {
    return value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return localized;
}

/**
 * Only allows http(s)/mailto URLs so a crafted "javascript:"
 * value stored in the profile can never execute in the browser.
 */
function safeHref(url: string): string {
  try {
    const parsed = new URL(url);

    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "mailto:"
    ) {
      return parsed.toString();
    }
  } catch {
    // Not a valid absolute URL — ignore.
  }

  return "#";
}

function sanitizeFileNamePart(value: string): string {
  return (
    value
      // Keep Unicode letters (Arabic included) so localized names
      // still produce a meaningful download file name.
      .replace(/[^\p{L}\p{N}\-_ ]/gu, "")
      .trim()
      .replace(/\s+/g, "_") ?? ""
  );
}

const SectionHeader = ({
  label,
  accent,
  centered,
  rule,
}: {
  label: string;
  accent: string;
  centered?: boolean;
  rule?: boolean;
}) => (
  <h2
    className={`mb-2 border-b text-[13px] font-bold tracking-wider ${
      centered ? "text-center" : ""
    }`}
    style={{
      color: accent,
      borderColor: accent,
      borderWidth: rule ? "0 0 0.75px 0" : "0 0 1.5px 0",
    }}
  >
    {label}
  </h2>
);

/** Section labels for the CV document itself, independent of UI language. */
const CV_SECTION_LABELS_AR: Record<string, string> = {
  summary: "الملخص",
  experience: "الخبرة المهنية",
  projects: "المشاريع",
  education: "التعليم",
  certificates: "الشهادات",
  skills: "المهارات",
  languages: "اللغات",
};

export default function ResumePreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const resumeId = searchParams?.get("id");

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // The CV document has its own language and template, independent of
  // the UI language — an Arabic CV renders RTL even in an English UI.
  const cvLanguage: "EN" | "AR" = resume?.language === "AR" ? "AR" : "EN";
  const isArCv = cvLanguage === "AR";
  const cvLocale = isArCv ? "ar" : locale;
  const preset = findCvTemplate(resume?.template ?? "MODERN");
  const accent = preset.preview.accent;
  const cvFamilyClass =
    preset.preview.family === "serif"
      ? "font-serif"
      : preset.preview.family === "mono"
        ? "font-mono"
        : "";
  const cvSectionLabel = (key: string) =>
    isArCv ? CV_SECTION_LABELS_AR[key] : t(`resume.preview.section.${key}`);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        // The resume holds the selected content; the profile holds the
        // personal/contact header the backend merges into the PDF.
        // The list endpoint returns resumes without their sections,
        // so the latest-resume fallback still loads its full details.
        const [profileData, resumeData] = await Promise.all([
          getProfile().catch(() => null),
          resumeId
            ? getResume(resumeId)
            : getResumes()
                .then((list) => (list[0] ? getResume(list[0].id) : null))
                .catch(() => null),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setResume(resumeData);
      } catch (error) {
        if (!cancelled) {
          setResume(null);
          setLoadError(getApiErrorMessage(error, t("resume.preview.loadFailed"), t));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, reloadKey]);

  /**
   * Derived exactly like the backend resume-mapper so the
   * preview matches the generated PDF field by field.
   */
  const cv = useMemo(() => {
    const contact = profile?.contactInfo ?? null;

    const fullName =
      `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "N/A";

    const contactItems = [
      contact?.email ?? "",
      contact?.phone ?? "",
      contact?.city ?? "",
    ].filter(Boolean);

    const links = contact?.links ?? [];

    const experiences = (resume?.experiences ?? []).map((item) => {
      const exp = item.experience ?? ({} as Resume["experiences"][number]["experience"]);

      return {
        id: item.id,
        jobTitle: exp.position ?? "",
        company: exp.company ?? "",
        location: exp.location ?? "",
        employmentType: formatEnum(exp.employmentType, t),
        dateRange: `${formatDate(exp.startDate, cvLocale)} - ${
          exp.currentlyWorking ? t("common.present") : formatDate(exp.endDate, cvLocale)
        }`,
        bullets:
          item.customDescription?.length > 0
            ? item.customDescription
            : (exp.description ?? []),
      };
    });

    const projects = (resume?.projects ?? []).map((item) => {
      const proj = item.project ?? ({} as Resume["projects"][number]["project"]);

      const links = [
        proj.github ? { type: t("resume.preview.label.github"), url: proj.github } : null,
        proj.liveDemo
          ? { type: t("resume.preview.label.liveDemo"), url: proj.liveDemo }
          : null,
      ].filter(Boolean) as { type: string; url: string }[];

      return {
        id: item.id,
        title: proj.name ?? "",
        description: item.customizedDescription || proj.description || "",
        technologies: proj.technologies ?? [],
        links,
        dateRange: `${formatDate(proj.startDate, cvLocale)} - ${
          proj.endDate ? formatDate(proj.endDate, cvLocale) : t("common.present")
        }`,
      };
    });

    const education = (resume?.educations ?? []).map((item) => {
      const edu = item.education ?? ({} as Resume["educations"][number]["education"]);

      return {
        id: item.id,
        degreeLine: [edu.degree, edu.field].filter(Boolean).join(" — "),
        university: edu.university ?? "",
        grade: edu.grade ?? "",
        description: edu.description ?? "",
        dateRange: `${formatDate(edu.startDate, cvLocale)} - ${formatDate(edu.endDate, cvLocale)}`,
      };
    });

    const certificates = (resume?.certificates ?? []).map((item) => {
      const cert = item.certificate ?? ({} as Resume["certificates"][number]["certificate"]);

      return {
        id: item.id,
        name: cert.name ?? "",
        issuer: cert.issuer ?? "",
        date: formatDate(cert.issueDate, cvLocale),
        credentialId: cert.credentialId ?? "",
        url: cert.credentialUrl ?? "",
      };
    });

    const skills = (resume?.skills ?? [])
      .map((item) => item.skill?.name)
      .filter(Boolean) as string[];

    const summary = resume?.generatedSummary ?? "";

    const hasContent =
      Boolean(summary) ||
      experiences.length > 0 ||
      projects.length > 0 ||
      education.length > 0 ||
      certificates.length > 0 ||
      skills.length > 0;

    return {
      fullName,
      title: profile?.headline || resume?.title || "",
      contactItems,
      links,
      summary,
      experiences,
      projects,
      education,
      certificates,
      skills,
      hasContent,
    };
  }, [profile, resume, t, locale]);

  const fileName = `${sanitizeFileNamePart(profile?.firstName ?? "") || "Your"}_${
    sanitizeFileNamePart(profile?.lastName ?? "") || "CV"
  }_CV.pdf`;

  const handleGeneratePdf = useCallback(async () => {
    if (downloading || !resume) return;

    setDownloading(true);
    setDownloadError(null);

    let objectUrl: string | null = null;

    try {
      const blob = await downloadResumePdf(resume.id);

      objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloaded(true);
    } catch (error) {
      setDownloaded(false);
      setDownloadError(
        getApiErrorMessage(error, t("resume.preview.pdfFailed"), t),
      );
    } finally {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      setDownloading(false);
    }
  }, [downloading, resume, fileName, t]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span>{t("resume.preview.loading")}</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          icon={<Eye size={24} />}
          title={t("resume.preview.title")}
          subtitle={t("resume.preview.subtitleReview")}
        />

        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <FileText size={32} className="text-gray-300 dark:text-gray-600" />

          <p className="text-sm text-gray-600 dark:text-gray-400">{loadError}</p>

          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => setReloadKey((key) => key + 1)}>
              <RefreshCw size={15} />
              {t("common.retry")}
            </Btn>

            <Btn onClick={() => router.push("/resume")}>
              {t("resume.preview.back")}
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader
          icon={<Eye size={24} />}
          title={t("resume.preview.title")}
          subtitle={t("resume.preview.subtitleReview")}
        />

        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <FileText size={32} className="text-gray-300 dark:text-gray-600" />

          <p className="font-medium text-gray-900 dark:text-gray-100">
            {t("resume.preview.noResume")}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("resume.preview.noResumeHint")}
          </p>

          <Btn onClick={() => router.push("/resume")}>
            {t("resume.preview.buildResume")}
            <ArrowLeft size={15} className="rotate-180 rtl-flip" />
          </Btn>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={<Eye size={24} />}
        title={t("resume.preview.title")}
        subtitle={t("resume.preview.subtitle")}
      />

      {/* Actions */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Btn variant="outline" size="sm" onClick={() => router.push("/resume")}>
          <ArrowLeft size={14} className="rtl-flip" />
          {t("resume.preview.back")}
        </Btn>

        <Btn onClick={() => void handleGeneratePdf()} disabled={downloading}>
          {downloading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t("resume.preview.generating")}
            </>
          ) : (
            <>
              <FileDown size={16} />
              {t("resume.preview.generatePdf")}
            </>
          )}
        </Btn>
      </div>

      {downloaded && !downloadError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            {t("resume.preview.success")}
          </span>

          <button
            type="button"
            onClick={() => void handleGeneratePdf()}
            disabled={downloading}
            className="font-medium underline hover:text-emerald-800 disabled:opacity-50 dark:hover:text-emerald-300"
          >
            {t("resume.preview.downloadAgain")}
          </button>
        </div>
      )}

      {downloadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {downloadError}
        </div>
      )}

      {/* Resume sheet */}
      <Card className="overflow-hidden shadow-xl dark:bg-gray-900">
        <div
          dir={isArCv ? "rtl" : "ltr"}
          className={`px-6 py-10 sm:px-10 ${cvFamilyClass}`}
          style={{ textAlign: isArCv ? "right" : "left" }}
        >
          {/* Header */}
          <header
            className={
              preset.preview.headerStyle === "centered" ? "text-center" : ""
            }
          >
            <h1
              className={`text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100 ${
                preset.preview.headingCase === "uppercase" && !isArCv
                  ? "uppercase tracking-[0.2em]"
                  : ""
              }`}
            >
              {cv.fullName}
            </h1>

            {cv.title && (
              <p
                className={`mt-1 text-sm sm:text-base ${
                  preset.preview.headerStyle === "bar" ? "font-semibold" : ""
                }`}
                style={{
                  color: preset.preview.headerStyle === "bar" ? accent : undefined,
                }}
              >
                {cv.title}
              </p>
            )}

            {cv.contactItems.length > 0 && (
              <p className="mt-3 text-xs text-[#555555] sm:text-sm dark:text-gray-400">
                {cv.contactItems.join("  •  ")}
              </p>
            )}

            {cv.links.length > 0 && (
              <p
                className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${
                  preset.preview.headerStyle === "centered" ? "justify-center" : ""
                }`}
              >
                {cv.links.map((link, index) => (
                  <span key={`${link.id}-${index}`}>
                    {index > 0 && (
                      <span className="mr-3 text-[#999999] dark:text-gray-600">•</span>
                    )}
                    <a
                      href={safeHref(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: accent }}
                    >
                      {formatEnum(link.type, t)}
                    </a>
                  </span>
                ))}
              </p>
            )}

            {(preset.preview.headerStyle === "bar" ||
              preset.preview.headerStyle === "rule") && (
              <div
                className="mt-4 w-full"
                style={{
                  height: preset.preview.headerStyle === "bar" ? "2px" : "0.75px",
                  backgroundColor:
                    preset.preview.headerStyle === "bar" ? accent : "#9ca3af",
                }}
              />
            )}
          </header>

          {!cv.hasContent ? (
            <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
              {t("resume.preview.emptyResume")}
            </p>
          ) : (
            <div className="mt-5 space-y-6 text-sm text-[#2a2a2a] dark:text-gray-200">
              {cv.summary && (
                <section>
                  <SectionHeader
                    label={cvSectionLabel("summary")}
                    accent={accent}
                    centered={preset.preview.headerStyle === "centered"}
                    rule={preset.preview.headerStyle === "rule" || preset.preview.headerStyle === "plain"}
                  />

                  <p className="text-justify leading-relaxed">{cv.summary}</p>
                </section>
              )}

              {cv.experiences.length > 0 && (
                <section>
                  <SectionHeader
                    label={cvSectionLabel("experience")}
                    accent={accent}
                    centered={preset.preview.headerStyle === "centered"}
                    rule={preset.preview.headerStyle === "rule" || preset.preview.headerStyle === "plain"}
                  />

                  <div className="space-y-5">
                    {cv.experiences.map((experience) => (
                      <div key={experience.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <p className="text-[15px] font-bold text-[#1a1a1a] dark:text-gray-100">
                            {experience.jobTitle}

                            {experience.company && (
                              <span className="font-normal text-[#4a4a4a] dark:text-gray-300">
                                {" "}
                                - {experience.company}
                              </span>
                            )}

                            {experience.location && (
                              <span className="font-normal text-[#4a4a4a] dark:text-gray-300">
                                {" "}
                                | {experience.location}
                              </span>
                            )}
                          </p>

                          <div className="text-end">
                            <p className="text-xs text-[#666666] dark:text-gray-400">
                              {experience.dateRange}
                            </p>

                            {experience.employmentType && (
                              <p className="text-[11px] italic text-[#777777] dark:text-gray-500">
                                {experience.employmentType}
                              </p>
                            )}
                          </div>
                        </div>

                        {experience.bullets.length > 0 && (
                          <ul className="mt-1.5 list-disc space-y-1 ps-5 leading-relaxed text-[#2a2a2a] dark:text-gray-300">
                            {experience.bullets.map((bullet, index) => (
                              <li key={index}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {cv.projects.length > 0 && (
                <section>
                  <SectionHeader
                    label={cvSectionLabel("projects")}
                    accent={accent}
                    centered={preset.preview.headerStyle === "centered"}
                    rule={preset.preview.headerStyle === "rule" || preset.preview.headerStyle === "plain"}
                  />

                  <div className="space-y-5">
                    {cv.projects.map((project) => (
                      <div key={project.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <p className="text-[15px] font-bold text-[#1a1a1a] dark:text-gray-100">
                            {project.title}

                            {project.links.map((link, index) => (
                              <span key={link.type}>
                                <span className="mx-2 text-[#666666] dark:text-gray-400">
                                  {index === 0 ? "-" : "|"}
                                </span>

                                <a
                                  href={safeHref(link.url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-normal text-[#0066cc] underline dark:text-blue-400"
                                >
                                  {link.type}
                                </a>
                              </span>
                            ))}
                          </p>

                          <p className="text-xs text-[#666666] dark:text-gray-400">
                            {project.dateRange}
                          </p>
                        </div>

                        {project.description && (
                          <p className="mt-1 text-justify leading-relaxed">
                            {project.description}
                          </p>
                        )}

                        {project.technologies.length > 0 && (
                          <p className="mt-1 text-[#0066cc] dark:text-blue-400">
                            {t("resume.preview.label.technologies", {
                              list: project.technologies.join(", "),
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {cv.education.length > 0 && (
                <section>
                  <SectionHeader
                    label={cvSectionLabel("education")}
                    accent={accent}
                    centered={preset.preview.headerStyle === "centered"}
                    rule={preset.preview.headerStyle === "rule" || preset.preview.headerStyle === "plain"}
                  />

                  <div className="space-y-4">
                    {cv.education.map((education) => (
                      <div key={education.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <p className="text-[15px] font-bold text-[#1a1a1a] dark:text-gray-100">
                            {education.degreeLine}

                            {education.university && (
                              <span className="font-normal text-[#4a4a4a] dark:text-gray-300">
                                {" "}
                                - {education.university}
                              </span>
                            )}
                          </p>

                          <p className="text-xs text-[#666666] dark:text-gray-400">
                            {education.dateRange}
                          </p>
                        </div>

                        {education.grade && (
                          <p className="mt-0.5 text-sm text-[#4a4a4a] dark:text-gray-300">
                            {t("resume.preview.label.grade", {
                              grade: education.grade,
                            })}
                          </p>
                        )}

                        {education.description && (
                          <p className="mt-1 text-justify leading-relaxed">
                            {education.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {cv.certificates.length > 0 && (
                <section>
                  <SectionHeader
                    label={cvSectionLabel("certificates")}
                    accent={accent}
                    centered={preset.preview.headerStyle === "centered"}
                    rule={preset.preview.headerStyle === "rule" || preset.preview.headerStyle === "plain"}
                  />

                  <div className="space-y-4">
                    {cv.certificates.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                      >
                        <p className="text-[15px] font-bold text-[#1a1a1a] dark:text-gray-100">
                          {certificate.name}

                          {certificate.issuer && (
                            <span className="font-normal text-[#4a4a4a] dark:text-gray-300">
                              {" "}
                              -{" "}
                              {certificate.url ? (
                                <a
                                  href={safeHref(certificate.url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0066cc] underline dark:text-blue-400"
                                >
                                  {certificate.issuer}
                                </a>
                              ) : (
                                certificate.issuer
                              )}
                            </span>
                          )}
                        </p>

                        <div className="text-end">
                          <p className="text-xs text-[#666666] dark:text-gray-400">
                            {certificate.date}
                          </p>

                          {certificate.credentialId && (
                            <p className="text-[11px] text-[#777777] dark:text-gray-500">
                              {t("resume.preview.label.credentialId", {
                                id: certificate.credentialId,
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {cv.skills.length > 0 && (
                <section>
                  <SectionHeader
                    label={cvSectionLabel("skills")}
                    accent={accent}
                    centered={preset.preview.headerStyle === "centered"}
                    rule={preset.preview.headerStyle === "rule" || preset.preview.headerStyle === "plain"}
                  />

                  <p className="leading-relaxed">{cv.skills.join("  •  ")}</p>
                </section>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
