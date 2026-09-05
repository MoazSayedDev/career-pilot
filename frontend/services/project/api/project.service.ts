import axios from "@/lib/axios";
import { CreateProjectDto, Project, UpdateProjectDto } from "../types/project";

const BASE_URL = "/project";

export const createProject = async (
  data: CreateProjectDto,
): Promise<Project> => {
  try {
    const response = await axios.post(BASE_URL, data);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await axios.get(BASE_URL);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getProject = async (id: string): Promise<Project> => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateProject = async (
  id: string,
  data: UpdateProjectDto,
): Promise<Project> => {
  try {
    const response = await axios.patch(`${BASE_URL}/${id}`, data);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    throw error;
  }
};
