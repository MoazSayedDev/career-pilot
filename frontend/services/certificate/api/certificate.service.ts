import axios from "@/lib/axios";

import type {
  Certificate,
  CreateCertificateDto,
  UpdateCertificateDto,
} from "../types/certificate";

const BASE_URL = "/certificate";

export const createCertificate = async (
  data: CreateCertificateDto,
): Promise<Certificate> => {
  const response = await axios.post(BASE_URL, data);
  return response.data.data;
};

export const getCertificates = async (): Promise<Certificate[]> => {
  const response = await axios.get(BASE_URL);
  return response.data.data;
};

export const updateCertificate = async (
  id: string,
  data: UpdateCertificateDto,
): Promise<Certificate> => {
  const response = await axios.patch(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

export const deleteCertificate = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`);
};
