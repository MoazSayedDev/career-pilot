export const LANGUAGE_LEVELS = [
  "BASIC",
  "CONVERSATIONAL",
  "PROFESSIONAL",
  "NATIVE",
] as const;

export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

export const LANGUAGE_LEVEL_LABELS: Record<LanguageLevel, string> = {
  BASIC: "BASIC",
  CONVERSATIONAL: "CONVERSATIONAL",
  PROFESSIONAL: "PROFESSIONAL",
  NATIVE: "NATIVE",
};

export interface Language {
  id: string;
  language: string;
  level: LanguageLevel;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLanguageDto {
  language: string;
  level: LanguageLevel;
}

export type UpdateLanguageDto = Partial<CreateLanguageDto>;
