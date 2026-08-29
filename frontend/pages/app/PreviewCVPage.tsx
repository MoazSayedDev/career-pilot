"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, LayoutTemplate, Download, Mail, Phone, MapPin, Globe, Link } from "lucide-react";

import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";

import { getContactInfo } from "@/services/contact-info/api/contact-info.api";
import type { ContactInfo } from "@/services/contact-info/types/contact-info";
import { LinkType } from "@/services/contact-info/types/contact-info";
import { getProfile } from "@/services/profile/api/profile.service";
import type { ProfileResponse } from "@/services/profile/types/profile";
import { getExperiences } from "@/services/experience/api/experience.service";
import type { Experience } from "@/services/experience/types/experience";
import { getProjects } from "@/services/project/api/project.service";
import type { Project } from "@/services/project/types/project";
import { getEducations } from "@/services/education/api/education.service";
import type { Education } from "@/services/education/types/education";
import { getSkills } from "@/services/skill/api/skill.service";
import type { Skill } from "@/services/skill/types/skill";
import { getCertificates } from "@/services/certificate/api/certificate.service";
import type { Certificate } from "@/services/certificate/types/certificate";
import { getResumes } from "@/services/resume/api/resume.service";
import { ResumeTemplate, type Resume } from "@/services/resume/types/resume";

interface PreviewCVPageProps {
  cvData?: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
      title?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string;
      linkedin?: string;
      github?: string;
      summary?: string;
    };
    selectedTemplate?: string;
    aiSummary?: string;
  };
  onNav?: (page: string) => void;
}

const SectionTitle = ({ label }: { label: string }) => (
  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700 mb-3">{label}</h3>
);

export default function PreviewCVPage({ cvData, onNav }: PreviewCVPageProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, contactData, experiencesData, projectsData, educationData, skillsData, certificateData, resumeData] = await Promise.all([
          getProfile().catch(() => null),
          getContactInfo().catch(() => null),
          getExperiences().catch(() => []),
          getProjects().catch(() => []),
          getEducations().catch(() => []),
          getSkills().catch(() => []),
          getCertificates().catch(() => []),
          getResumes().catch(() => []),
        ]);

        setProfile(profileData);
        setContactInfo(contactData);
        setExperiences(experiencesData);
        setProjects(projectsData);
        setEducation(educationData);
        setSkills(skillsData);
        setCertificates(certificateData);
        setResume(resumeData[0] ?? null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const personalInfo = useMemo(() => {
    const direct = cvData?.personalInfo ?? {};
    const name = `${profile?.firstName ?? direct.firstName ?? "First"} ${profile?.lastName ?? direct.lastName ?? "Last"}`.trim();
    const title = profile?.headline ?? direct.title ?? "Professional Title";
    const pp = {
      firstName: profile?.firstName ?? direct.firstName ?? "First",
      lastName: profile?.lastName ?? direct.lastName ?? "Last",
      title,
      email: contactInfo?.email ?? direct.email ?? "",
      phone: contactInfo?.phone ?? direct.phone ?? "",
      location: contactInfo?.city && contactInfo?.country ? `${contactInfo.city}, ${contactInfo.country}` : contactInfo?.city ?? direct.location ?? "",
      website: contactInfo?.links?.find((item) => item.type === LinkType.PORTFOLIO)?.url ?? direct.website ?? "",
      linkedin: contactInfo?.links?.find((item) => item.type === LinkType.LINKEDIN)?.url ?? direct.linkedin ?? "",
      github: contactInfo?.links?.find((item) => item.type === LinkType.GITHUB)?.url ?? direct.github ?? "",
      summary: profile?.bio ?? direct.summary ?? "",
    };
    return { ...pp, fullName: name };
  }, [cvData, profile, contactInfo]);

  const summary = resume?.generatedSummary || cvData?.aiSummary || personalInfo.summary;
  const selectedTemplate = resume?.template ?? cvData?.selectedTemplate ?? ResumeTemplate.MODERN;

  const go = (page: string) => {
    if (onNav) onNav(page);
    else router.push(`/resume/${page}`);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading preview...</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
            <Eye size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preview CV</h1>
            <p className="text-sm text-gray-500">
              Template: <span className="font-medium capitalize">{String(selectedTemplate).toLowerCase()}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Btn variant="outline" onClick={() => go("templates")}>
            <LayoutTemplate size={15} />
            Change Template
          </Btn>
          <Btn onClick={() => go("download")}>
            <Download size={15} />
            Download PDF
          </Btn>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="overflow-hidden shadow-xl">
          <div className="bg-violet-700 text-white px-10 py-8">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold">{personalInfo.fullName}</h1>
                <p className="text-violet-200 text-lg mt-1">{personalInfo.title}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                  {personalInfo.email && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100"><Mail size={13} />{personalInfo.email}</span>
                  )}
                  {personalInfo.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100"><Phone size={13} />{personalInfo.phone}</span>
                  )}
                  {personalInfo.location && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100"><MapPin size={13} />{personalInfo.location}</span>
                  )}
                  {personalInfo.website && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100"><Globe size={13} />{personalInfo.website}</span>
                  )}
                  {personalInfo.linkedin && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100"><Link size={13} />{personalInfo.linkedin}</span>
                  )}
                  {personalInfo.github && (
                    <span className="flex items-center gap-1.5 text-sm text-violet-100"><Link size={13} />{personalInfo.github}</span>
                  )}
                </div>
              </div>

              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                {`${personalInfo.firstName[0] ?? "?"}${personalInfo.lastName[0] ?? ""}`.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="p-10 flex gap-8">
            <div className="flex-1 min-w-0">
              {summary && (
                <section className="mb-7">
                  <SectionTitle label="Summary" />
                  <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
                </section>
              )}

              {experiences.length > 0 && (
                <section className="mb-7">
                  <SectionTitle label="Experience" />
                  {experiences.map((experience) => (
                    <div key={experience.id} className="mb-5 pl-4 border-l-2 border-gray-100 hover:border-violet-300 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-gray-900">{experience.position}</p>
                          <p className="text-violet-600 text-sm font-medium">{experience.company}</p>
                        </div>
                        <div className="text-right text-xs text-gray-400 flex-shrink-0">
                          <p>{new Date(experience.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} – {experience.currentlyWorking ? "Present" : experience.endDate ? new Date(experience.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present"}</p>
                          {experience.location && <p>{experience.location}</p>}
                        </div>
                      </div>
                      {experience.description?.length > 0 && (
                        <ul className="text-sm text-gray-600 mt-1.5 leading-relaxed list-disc pl-5 space-y-1">
                          {experience.description.map((item: string) => <li key={item}>{item}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {projects.length > 0 && (
                <section className="mb-7">
                  <SectionTitle label="Projects" />
                  {projects.map((project) => (
                    <div key={project.id} className="mb-5 pl-4 border-l-2 border-gray-100">
                      <p className="font-bold text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{project.description}</p>
                      {project.technologies?.length > 0 && (
                        <p className="text-xs text-violet-700 mt-2">{project.technologies.join(" · ")}</p>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>

            <div className="w-64 flex-shrink-0">
              {skills.length > 0 && (
                <section className="mb-7">
                  <SectionTitle label="Skills" />
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill.id} className="px-2 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">{skill.name}</span>
                    ))}
                  </div>
                </section>
              )}

              {education.length > 0 && (
                <section className="mb-7">
                  <SectionTitle label="Education" />
                  {education.map((item) => (
                    <div key={item.id} className="mb-4">
                      <p className="font-semibold text-gray-900">{item.degree}</p>
                      <p className="text-sm text-gray-600">{item.university}</p>
                      <p className="text-xs text-gray-400">{item.field}</p>
                    </div>
                  ))}
                </section>
              )}

              {certificates.length > 0 && (
                <section className="mb-7">
                  <SectionTitle label="Certificates" />
                  {certificates.map((item) => (
                    <div key={item.id} className="mb-4">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.issuer}</p>
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
