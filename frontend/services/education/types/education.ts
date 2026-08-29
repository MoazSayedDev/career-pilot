export interface Education {
  id: string;
  university: string;
  degree: string;
  field: string;
  grade?: string | null;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEducationDto {
  university: string;
  degree: string;
  field: string;
  grade?: string;
  description?: string;
  startDate: string;
  endDate?: string;
}

export type UpdateEducationDto = Partial<CreateEducationDto>;
