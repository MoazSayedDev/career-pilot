import { CvLanguage, ResumeTemplate } from '@prisma/client';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateResumeDto {
  @IsString()
  @MaxLength(150)
  title!: string;

  @IsEnum(ResumeTemplate)
  template!: ResumeTemplate;

  /** Output language of the CV document (Arabic CVs render RTL). */
  @IsOptional()
  @IsEnum(CvLanguage)
  language?: CvLanguage;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  jobDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  generatedSummary?: string;

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  @IsUUID('4', { each: true })
  skillIds: string[] = [];

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  @IsUUID('4', { each: true })
  experienceIds: string[] = [];

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  @IsUUID('4', { each: true })
  educationIds: string[] = [];

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  @IsUUID('4', { each: true })
  projectIds: string[] = [];

  @IsArray()
  @IsOptional()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  certificateIds: string[] = [];

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  @IsUUID('4', { each: true })
  languageIds: string[] = [];

  @IsOptional()
  @MaxLength(4000, { each: true })
  experienceDescriptions?: Record<string, string[]>;

  @IsOptional()
  @MaxLength(4000, { each: true })
  projectDescriptions?: Record<string, string>;
}

export class CreateResumeByJobDescriptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  jobDescription!: string;
}
