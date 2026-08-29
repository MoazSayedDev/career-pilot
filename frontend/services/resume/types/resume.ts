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
    jobTitle: string;
    company: string;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
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
    technologies: string[];
    github?: string | null;
    liveDemo?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };
}

export interface ResumeEducation {
  id: string;
  educationId: string;
  education: {
    id: string;
    degree?: string | null;
    fieldOfStudy?: string | null;
    institution?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };
}

export interface ResumeCertificate {
  id: string;
  certificateId: string;
  certificate: {
    id: string;
    name?: string | null;
    issuer?: string | null;
    issueDate?: string | null;
  };
}

export interface ResumeLanguage {
  id: string;
  languageId: string;
  language: {
    id: string;
    name: string;
    level?: string | null;
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

  generatedSummary?: string;

  skillIds: string[];
  experienceIds: string[];
  projectIds: string[];
  languageIds: string[];
  educationIds: string[];
  certificateIds?: string[];
}

export type UpdateResumeDto = Partial<CreateResumeDto>;

export interface ResumeFormData {
  title: string;
  template: ResumeTemplate;

  jobDescription: string;
  generatedSummary: string;

  skillIds: string[];
  experienceIds: string[];
  educationIds: string[];
  projectIds: string[];
  certificateIds: string[];
  languageIds: string[];

  experienceDescriptions: Record<string, string[]>;
  projectDescriptions: Record<string, string>;
}
