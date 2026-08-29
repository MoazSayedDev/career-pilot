import axios from "@/lib/axios";
import { CreateSkillDto, Skill, UpdateSkillDto } from "../types/skill";

const BASE_URL = "/skill";

export const createSkill = async (data: CreateSkillDto): Promise<Skill> => {
  try {
    const response = await axios.post(BASE_URL, data);
    return response.data.data;
  } catch (error) {
    console.error("Error creating skill:", error);
    throw error;
  }
};

export const getSkills = async (): Promise<Skill[]> => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
};

export const updateSkill = async (
  id: string,
  data: UpdateSkillDto,
): Promise<Skill> => {
  try {
    const response = await axios.patch(`${BASE_URL}/${encodeURIComponent(id)}`, data);
    return response.data.data;
  } catch (error) {
    console.error("Error updating skill:", error);
    throw error;
  }
};

export const deleteSkill = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${encodeURIComponent(id)}`);
};
