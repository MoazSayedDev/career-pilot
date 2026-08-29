import axios from "@/lib/axios";
import {
  CreateProfileDto,
  ProfileResponse,
  UpdateProfileDto,
} from "../types/profile";

const BASE_URL = "/profile";

export const createProfile = async (
  data: CreateProfileDto,
): Promise<ProfileResponse> => {
  try {
    const response = await axios.post(BASE_URL, data);
    return response.data.data;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
};

export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const updateProfile = async (
  data: UpdateProfileDto,
): Promise<ProfileResponse> => {
  try {
    const response = await axios.patch(BASE_URL, data);
    return response.data.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const deleteProfile = async (): Promise<void> => {
  try {
    await axios.delete(BASE_URL);
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw error;
  }
};
