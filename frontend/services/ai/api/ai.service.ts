import axios from "@/lib/axios";

import type { OptimizeResumeResponse } from "../types/ai";

const BASE_URL = "/ai";

export const optimizeResume = async (
  jobDescription: string,
): Promise<OptimizeResumeResponse> => {
  const response = await axios.post(`${BASE_URL}/optimize-resume`, {
    jobDescription,
  });

  return response.data.data ?? response.data;
};
