export enum LinkType {
  LINKEDIN = "LINKEDIN",
  GITHUB = "GITHUB",
  PORTFOLIO = "PORTFOLIO",
  FACEBOOK = "FACEBOOK",
  TWITTER = "TWITTER",
  OTHER = "OTHER",
}

export interface ProfileLink {
  id: string;
  type: LinkType;
  url: string;
  contactInfoId: string;
}

export interface ContactInfo {
  id: string;
  phone: string | null;
  email: string | null;
  links: ProfileLink[];
  country: string | null;
  city: string | null;
  profileId: string;
}

export interface CreateContactInfoDto {
  phone?: string;
  email?: string;
  links?: {
    type: LinkType;
    url: string;
  }[];
  country?: string;
  city?: string;
}

export type UpdateContactInfoDto = Partial<CreateContactInfoDto>;
