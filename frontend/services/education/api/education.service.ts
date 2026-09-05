import axios from "@/lib/axios";
import {
  CreateEducationDto,
  Education,
  UpdateEducationDto,
} from "../types/education";

const BASE_URL = "/education";

export const createEducation = async (
  data: CreateEducationDto,
): Promise<Education> => {
  try {
    const response = await axios.post(BASE_URL, data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getEducations = async (): Promise<Education[]> => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getEducationById = async (
  id: string,
): Promise<Education> => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateEducation = async (
  id: string,
  data: UpdateEducationDto,
): Promise<Education> => {
  try {
    const response = await axios.patch(`${BASE_URL}/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEducation = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    throw error;
  }
};
