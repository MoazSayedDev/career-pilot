"use client";

import {
  Eye,
  LayoutTemplate,
  Download,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link,
} from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string;
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
  startDate: string;
  endDate: string;
}

interface EducationItem {
  id: string;
  degree: string;
  school: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface SkillItem {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: string;
}

interface CertificateItem {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
}

interface CVData {
  personalInfo: PersonalInfo;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  skills: SkillItem[];
  certificates: CertificateItem[];
  selectedTemplate: string;
  aiSummary?: string;
}

interface PreviewCVPageProps {
  cvData: CVData;
  onNav: (page: string) => void;
}

export default function PreviewCVPage({ cvData, onNav }: PreviewCVPageProps) {
  const personalInfo = cvData.personalInfo;

  const fullName = `${personalInfo.firstName || "First"} ${
    personalInfo.lastName || "Last"
  }`.trim();

  const initials = `${personalInfo.firstName?.[0] || "?"}${
    personalInfo.lastName?.[0] || ""
  }`.toUpperCase();

  const summary = cvData.aiSummary || personalInfo.summary;

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
            <Eye size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preview CV</h1>

            <p className="text-sm text-gray-500">
              Template:{" "}
              <span className="font-medium capitalize">
                {cvData.selectedTemplate || "Default"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Btn variant="outline" onClick={() => onNav("templates")}>
            <LayoutTemplate size={15} />
            Change Template
          </Btn>

          <Btn onClick={() => onNav("download-cv")}>
            <Download size={15} />
            Download PDF
          </Btn>
        </div>
      </div>

      {/* ================= CV ================= */}
      <div className="max-w-3xl mx-auto">
        <Card className="overflow-hidden shadow-xl">
          {/* ================= CV HEADER ================= */}
          <div className="bg-violet-700 text-white px-10 py-8">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold">{fullName}</h1>

                <p className="text-violet-200 text-lg mt-1">
                  {personalInfo.title || "Professional Title"}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                  {personalInfo.email && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100">
                      <Mail size={13} />
                      {personalInfo.email}
                    </span>
                  )}

                  {personalInfo.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100">
                      <Phone size={13} />
                      {personalInfo.phone}
                    </span>
                  )}

                  {personalInfo.location && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100">
                      <MapPin size={13} />
                      {personalInfo.location}
                    </span>
                  )}

                  {personalInfo.website && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100">
                      <Globe size={13} />
                      {personalInfo.website}
                    </span>
                  )}

                  {personalInfo.linkedin && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100">
                      <Link size={13} />
                      {personalInfo.linkedin}
                    </span>
                  )}

                  {personalInfo.github && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100">
                      <Link size={13} />
                      {personalInfo.github}
                    </span>
                  )}
                </div>
              </div>

              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                {initials}
              </div>
            </div>
          </div>

          {/* ================= CV BODY ================= */}
          <div className="p-10 flex gap-8">
            {/* ================= MAIN COLUMN ================= */}
            <div className="flex-1 min-w-0">
              {/* Summary */}
              {summary && (
                <section className="mb-7">
                  <SectionTitle label="Summary" />

                  <p className="text-sm text-gray-700 leading-relaxed">
                    {summary}
                  </p>
                </section>
              )}

              {/* Experience */}
              {cvData.experiences.length > 0 && (
                <section className="mb-7">
                  <SectionTitle label="Experience" />

                  {cvData.experiences.map((experience) => (
                    <div
                      key={experience.id}
                      className="mb-5 pl-4 border-l-2 border-gray-100 hover:border-violet-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-gray-900">
                            {experience.title}
                          </p>

                          <p className="text-violet-600 text-sm font-medium">
                            {experience.company}
                          </p>
                        </div>

                        <div className="text-right text-xs text-gray-400 flex-shrink-0">
                          <p>
                            {experience.startDate} –{" "}
                            {experience.current
                              ? "Present"
                              : experience.endDate}
                          </p>

                          {experience.location && <p>{experience.location}</p>}
                        </div>
                      </div>

                      {experience.description && (
                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                          {experience.description}
                        </p>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Projects */}
              {cvData.projects.length > 0 && (
                <section className="mb-7">
                  <SectionTitle label="Projects" />

                  {cvData.projects.map((project) => (
                    <div key={project.id} className="mb-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-bold text-gray-900">
                          {project.name}
                        </p>

                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-violet-600 hover:underline"
                          >
                            View Project
                          </a>
                        )}
                      </div>

                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {project.description}
                        </p>
                      )}

                      {project.technologies && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Tech:</span>{" "}
                          {project.technologies}
                        </p>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>

            {/* ================= SIDEBAR ================= */}
            <div className="w-48 flex-shrink-0">
              {/* Education */}
              {cvData.education.length > 0 && (
                <section className="mb-7">
                  <SideTitle label="Education" />

                  {cvData.education.map((education) => (
                    <div key={education.id} className="mb-4">
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {education.degree}
                      </p>

                      <p className="text-xs text-violet-600 font-medium">
                        {education.school}
                      </p>

                      <p className="text-xs text-gray-400 mt-0.5">
                        {education.startDate} –{" "}
                        {education.current ? "Present" : education.endDate}
                      </p>
                    </div>
                  ))}
                </section>
              )}

              {/* Skills */}
              {cvData.skills.length > 0 && (
                <section className="mb-7">
                  <SideTitle label="Skills" />

                  <div className="flex flex-col gap-1.5">
                    {cvData.skills.slice(0, 10).map((skill) => {
                      const levels = [
                        "Beginner",
                        "Intermediate",
                        "Advanced",
                        "Expert",
                      ];

                      const currentLevel = levels.indexOf(skill.level);

                      return (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-xs text-gray-700">
                            {skill.name}
                          </span>

                          <div className="flex gap-0.5">
                            {levels.map((level, index) => (
                              <div
                                key={level}
                                className={`w-2 h-2 rounded-full ${
                                  currentLevel >= index
                                    ? "bg-violet-500"
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Certificates */}
              {cvData.certificates.length > 0 && (
                <section>
                  <SideTitle label="Certificates" />

                  {cvData.certificates.map((certificate) => (
                    <div key={certificate.id} className="mb-3">
                      <p className="text-xs font-bold text-gray-900 leading-tight">
                        {certificate.name}
                      </p>

                      <p className="text-xs text-violet-600">
                        {certificate.organization}
                      </p>

                      <p className="text-xs text-gray-400">
                        {certificate.issueDate}
                      </p>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================= SECTION TITLE ================= */

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-sm font-bold tracking-widest text-violet-700 uppercase">
        {label}
      </h2>

      <div className="flex-1 h-px bg-violet-200" />
    </div>
  );
}

/* ================= SIDEBAR TITLE ================= */

function SideTitle({ label }: { label: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-bold tracking-widest text-violet-700 uppercase border-b border-violet-200 pb-1">
        {label}
      </h2>
    </div>
  );
}
