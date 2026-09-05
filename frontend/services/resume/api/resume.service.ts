import axios from "@/lib/axios";
import {
  CreateResumeByJobDescriptionDto,
  CreateResumeDto,
  CreateResumeResponse,
  Resume,
  ResumeDetails,
} from "../types/resume";

const BASE_URL = "/resume";

/**
 * AI resume generation can take a while (the backend calls
 * Gemini synchronously), so it gets a dedicated timeout instead
 * of hanging until an infrastructure-level timeout kicks in.
 */
const AI_TIMEOUT_MS = 120_000;
const PDF_TIMEOUT_MS = 60_000;

export const createResume = async (
  data: CreateResumeDto,
): Promise<CreateResumeResponse> => {
  const response = await axios.post(BASE_URL, data);
  return response.data.data;
};

export const createResumeByJobDescription = async (
  data: CreateResumeByJobDescriptionDto,
): Promise<CreateResumeResponse> => {
  const response = await axios.post(`${BASE_URL}/by-job-description`, data, {
    timeout: AI_TIMEOUT_MS,
  });
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

export const downloadResumePdf = async (resumeId: string): Promise<Blob> => {
  const response = await axios.get(`/pdf/${resumeId}`, {
    responseType: "blob",
    timeout: PDF_TIMEOUT_MS,
  });

  const blob = response.data as Blob;

  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("The server returned an empty PDF file.");
  }

  if (blob.type && !blob.type.includes("application/pdf")) {
    throw new Error("The server returned an unexpected file type.");
  }

  return blob;
};
