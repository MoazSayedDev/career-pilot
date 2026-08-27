import axios from "@/lib/axios";
import { CreateResumeDto, Resume, ResumeDetails, UpdateResumeDto } from "../types/resume";

const BASE_URL = "/resume";

export const createResume = async (data: CreateResumeDto): Promise<Resume> => {
  const response = await axios.post(BASE_URL, data);
  return response.data.data;
};

export const getResumes = async (): Promise<Resume[]> => {
  const response = await axios.get(BASE_URL);
  return response.data.data;
};

export const getResume = async (id: string): Promise<ResumeDetails> => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

export const updateResume = async (
  id: string,
  data: UpdateResumeDto,
): Promise<ResumeDetails> => {
  const response = await axios.patch(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

export const deleteResume = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`);
};

export const downloadResumePdf = async (resumeId: string): Promise<Blob> => {
  const response = await axios.get(`${BASE_URL}/pdf/${resumeId}`, {
    responseType: "blob",
  });

  return response.data as Blob;
};
