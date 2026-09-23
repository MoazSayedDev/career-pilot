import api from "@/lib/axios";

import type {
  GeminiKeyDto,
  GeminiKeyStatus,
  GeminiKeyStatusResponse,
} from "../types/ai.types";

const BASE_URL = "/ai";

/**
 * Checks whether the signed-in user has a personal Gemini API key
 * configured on the backend.
 *
 * The key itself never leaves the server — only the boolean flag
 * is returned, so there is nothing sensitive to expose here.
 */
export const getGeminiKeyStatus = async (): Promise<GeminiKeyStatus> => {
  const response = await api.get<GeminiKeyStatusResponse>(
    `${BASE_URL}/gemini-key/status`,
  );

  return response.data.data;
};

/**
 * Stores (first-time add) a personal Gemini API key for the user.
 * The backend encrypts it before persisting; the value is never
 * stored client-side beyond the lifetime of this request.
 */
export const setGeminiKey = async (dto: GeminiKeyDto): Promise<void> => {
  await api.post(`${BASE_URL}/gemini-key`, dto);
};

/**
 * Replaces an already-configured personal Gemini API key.
 */
export const updateGeminiKey = async (dto: GeminiKeyDto): Promise<void> => {
  await api.put(`${BASE_URL}/gemini-key`, dto);
};

/**
 * Removes the user's personal Gemini API key.
 */
export const deleteGeminiKey = async (): Promise<void> => {
  await api.delete(`${BASE_URL}/gemini-key`);
};
