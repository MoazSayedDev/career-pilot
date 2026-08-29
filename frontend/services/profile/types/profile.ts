import { ContactInfo } from "@/services/contact-info/types/contact-info";
import { Education } from "@/services/education/types/education";
import { Experience } from "@/services/experience/types/experience";
import { Language } from "@/services/language/types/language";
import { Skill } from "@/services/skill/types/skill";
import { Certificate } from "@/services/certificate/types/certificate";
import { Project } from "@/services/project/types/project";

export interface Profile {
  id: string;

  firstName: string;
  lastName: string;

  headline: string | null;
  bio: string | null;
  image: string | null;

  userId: string;

  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse extends Profile {
  contactInfo: ContactInfo | null;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  educations: Education[];
  certificates: Certificate[];
  languages: Language[];
}

export interface CreateProfileDto {
  firstName: string;
  lastName: string;
  headline?: string;
  bio?: string;
  image?: string;
}

export type UpdateProfileDto = Partial<CreateProfileDto>;
