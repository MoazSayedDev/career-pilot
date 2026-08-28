import api from "@/lib/axios";
import {
  CreateExperienceDto,
  Experience,
  UpdateExperienceDto,
} from "../types/experience";

const BASE_URL = "/experience";

export const createExperience = async (
  data: CreateExperienceDto,
): Promise<Experience> => {
  const response = await api.post(BASE_URL, data);
  return response.data.data;
};

export const getExperiences = async (): Promise<Experience[]> => {
  const response = await api.get(BASE_URL);
  return response.data.data;
};

export const getExperienceById = async (id: string): Promise<Experience> => {
  const response = await api.get(`${BASE_URL}/${encodeURIComponent(id)}`);
  return response.data.data;
};

export const updateExperience = async (
  id: string,
  data: Omit<UpdateExperienceDto, "id">,
): Promise<Experience> => {
  const response = await api.patch(
    `${BASE_URL}/${encodeURIComponent(id)}`,
    data,
  );
  return response.data.data;
};

export const deleteExperience = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${encodeURIComponent(id)}`);
};
