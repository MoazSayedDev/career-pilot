import axios from "@/lib/axios";
import {
  ContactInfo,
  CreateContactInfoDto,
  UpdateContactInfoDto,
} from "../types/contact-info";

const BASE_URL = "/contact-info";

export const createContactInfo = async (
  data: CreateContactInfoDto,
): Promise<ContactInfo> => {
  try {
    const response = await axios.post(BASE_URL, data);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getContactInfo = async (): Promise<ContactInfo> => {
  try {
    const response = await axios.get(BASE_URL);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateContactInfo = async (
  data: UpdateContactInfoDto,
): Promise<ContactInfo> => {
  try {
    const response = await axios.patch(BASE_URL, data);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteContactInfo = async (): Promise<void> => {
  try {
    await axios.delete(BASE_URL);
  } catch (error) {
    throw error;
  }
};
