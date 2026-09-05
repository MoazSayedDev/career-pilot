export enum ResumeTemplate {
  MODERN = "MODERN",
  CLASSIC = "CLASSIC",
  MINIMAL = "MINIMAL",
}

export interface ResumeSkill {
  id: string;
  skillId: string;
  skill: {
    id: string;
    name: string;
  };
}

export interface ResumeExperience {
  id: string;
  experienceId: string;
  customDescription: string[];
  experience: {
    id: string;
    company: string;
    position: string;
    employmentType: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    currentlyWorking: boolean;
    description: string[];
    technologies: string[];
  };
}

export interface ResumeProject {
  id: string;
  projectId: string;
  customizedDescription: string;
  project: {
    id: string;
    name: string;
    description: string;
    github: string | null;
    liveDemo: string | null;
    technologies: string[];
    startDate: string | null;
    endDate: string | null;
  };
}

export interface ResumeEducation {
  id: string;
  educationId: string;
  education: {
    id: string;
    university: string;
    degree: string;
    field: string;
    grade: string | null;
    startDate: string;
    endDate: string | null;
    description: string | null;
  };
}

export interface ResumeCertificate {
  id: string;
  certificateId: string;
  certificate: {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expirationDate: string | null;
    credentialId: string | null;
    credentialUrl: string | null;
  };
}

export interface ResumeLanguage {
  id: string;
  languageId: string;
  language: {
    id: string;
    language: string;
    level: string | null;
  };
}

export interface Resume {
  id: string;
  title: string;
  template: ResumeTemplate;
  jobDescription?: string | null;
  generatedSummary?: string | null;
  profileId: string;

  skills: ResumeSkill[];
  experiences: ResumeExperience[];
  projects: ResumeProject[];
  educations: ResumeEducation[];
  certificates: ResumeCertificate[];
  languages: ResumeLanguage[];

  createdAt?: string;
  updatedAt?: string;
}

export type ResumeDetails = Resume;

export interface CreateResumeDto {
  title: string;
  template: string;

  skillIds: string[];
  experienceIds: string[];
  educationIds: string[];
  projectIds: string[];
  certificateIds: string[];
  languageIds: string[];
}

export interface CreateResumeByJobDescriptionDto {
  jobDescription: string;
}

export interface CreateResumeResponse {
  message: string;
  id: string;
}
