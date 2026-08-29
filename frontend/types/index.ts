export type Page =
  | "landing" | "signin" | "signup" | "verify-otp" | "forgot-password"
  | "reset-password" | "dashboard" | "personal-info" | "experience"
  | "education" | "certificates" | "skills" | "projects" | "ai-summary"
  | "templates" | "preview-cv" | "download-cv" | "settings";

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  field: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: string;
  category: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
  startDate: string;
  endDate: string;
}

export interface CVData {
  personalInfo: {
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
  };
  experiences: ExperienceItem[];
  education: EducationItem[];
  certificates: CertificateItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  aiSummary: string;
  selectedTemplate: string;
}
