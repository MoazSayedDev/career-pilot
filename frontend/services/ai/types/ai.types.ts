// ==================== Gemini API Key ====================

/**
 * Mirrors the backend's GeminiApiKeyStatus shape
 * (`{ configured: boolean }`) wrapped by the global
 * { success, message, data } response envelope.
 */
export interface GeminiKeyStatusResponse {
  success: boolean;
  message: string;
  data: {
    configured: boolean;
  };
}

/** Body for POST / PUT /ai/gemini-key. */
export interface GeminiKeyDto {
  apiKey: string;
}

/** Plain result used by the UI after unwrapping the envelope. */
export interface GeminiKeyStatus {
  configured: boolean;
}
