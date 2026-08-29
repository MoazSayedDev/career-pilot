export const EMPLOYMENT_TYPE = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPE)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  INTERNSHIP: "INTERNSHIP",
  FREELANCE: "FREELANCE",
};

export interface Experience {
  id: string;
  company: string;
  position: string;
  employmentType: EmploymentType;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  currentlyWorking: boolean;
  description: string[];
  technologies: string[];
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperienceDto {
  company: string;
  position: string;
  employmentType: EmploymentType;
  location?: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  description: string[];
  technologies: string[];
}

export interface UpdateExperienceDto extends Partial<CreateExperienceDto> {
  id: string;
}
