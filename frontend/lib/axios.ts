import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { getAccessToken, setAccessToken, clearAccessToken } from "./auth-token";

/**
 * Axios instance
 *
 * - baseURL: Base URL of the backend API.
 * - withCredentials: Allows the browser to send cookies
 *   with requests. This is required for the HttpOnly refresh token cookie.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

/**
 * Indicates whether a token refresh request
 * is currently in progress.
 *
 * This prevents multiple refresh requests
 * from being sent at the same time.
 */
let isRefreshing = false;

/**
 * Stores requests that received a 401 response
 * while another refresh request is already running.
 *
 * Example:
 *
 * Request A → 401 → starts refresh
 * Request B → 401 → waits
 * Request C → 401 → waits
 *
 * After the refresh succeeds,
 * B and C will be retried using the new token.
 */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * Processes all requests waiting for the new access token.
 *
 * If the refresh succeeds:
 *   processQueue(null, newAccessToken)
 *
 * If the refresh fails:
 *   processQueue(refreshError)
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    /**
     * If the refresh request failed,
     * reject all waiting requests.
     */
    if (error) {
      promise.reject(error);
    } else if (token) {

    /**
     * If the refresh succeeded,
     * provide the new access token
     * to all waiting requests.
     */
      promise.resolve(token);
    }
  });

  /**
   * Clear the queue after processing it.
   */
  failedQueue = [];
};

/**
 * ==========================================
 * Request Interceptor
 * ==========================================
 *
 * Runs before every request is sent
 * to the backend.
 *
 * Its job is to get the current access token
 * and add it to the Authorization header.
 *
 * Example:
 *
 * api.get("/resume")
 *
 * becomes:
 *
 * Authorization: Bearer <accessToken>
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    /**
     * Get the current access token.
     */
    const token = getAccessToken();

    /**
     * If an access token exists,
     * add it to the Authorization header.
     */
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * Return the config so Axios
     * can continue with the request.
     */
    return config;
  },

  /**
   * Handle errors that occur
   * while preparing the request.
   */
  (error) => Promise.reject(error),
);

/**
 * ==========================================
 * Response Interceptor
 * ==========================================
 *
 * Runs after the backend returns a response.
 *
 * Successful responses are returned normally.
 *
 * Errors are checked to determine
 * whether the user needs a new access token.
 */
api.interceptors.response.use(
  /**
   * Successful response.
   */
  (response) => response,

  /**
   * Handle response errors.
   */
  async (error: AxiosError) => {
    /**
     * Get the original request that failed.
     *
     * _retry is a custom property that we use
     * to prevent retrying the same request
     * multiple times.
     */
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    /**
     * Only handle 401 Unauthorized errors.
     *
     * Also stop if this request has already
     * been retried, or if the failed request
     * is the refresh request itself.
     *
     * Without the refresh check, the refresh
     * request's own 401 would be queued behind
     * the still-running refresh and neither
     * promise would ever settle.
     *
     * This prevents an infinite retry loop
     * and a self-deadlock.
     */
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url === "/auth/refresh"
    ) {
      return Promise.reject(error);
    }

    /**
     * Mark this request as already retried.
     */
    originalRequest._retry = true;

    /**
     * If another refresh request is already running,
     * do not start another refresh request.
     *
     * Instead, add the current request to the queue
     * and wait for the existing refresh request.
     */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          /**
           * Called when the refresh succeeds.
           *
           * Add the new token to the original request
           * and retry it.
           */
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            /**
             * Retry the original request.
             */
            resolve(api(originalRequest));
          },

          /**
           * Called when the refresh fails.
           */
          reject,
        });
      });
    }

    /**
     * No refresh request is currently running,
     * so start a new refresh request.
     */
    isRefreshing = true;

    try {
      /**
       * Request a new access token.
       *
       * We do NOT manually send the refresh token.
       *
       * The browser automatically sends the
       * HttpOnly refresh token cookie because
       * withCredentials is set to true.
       */
      const response = await api.post("/auth/refresh");

      /**
       * Extract the new access token
       * from the backend response.
       */
      const newAccessToken = response.data.data.accessToken;

      /**
       * Store the new access token in memory.
       */
      setAccessToken(newAccessToken);

      /**
       * Resolve all requests that were waiting
       * for the new access token.
       */
      processQueue(null, newAccessToken);

      /**
       * Add the new access token
       * to the original failed request.
       */
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      /**
       * Retry the original request.
       *
       * Example:
       *
       * GET /resume
       *      ↓
       * 401 Unauthorized
       *      ↓
       * POST /auth/refresh
       *      ↓
       * New access token
       *      ↓
       * GET /resume again
       */
      return api(originalRequest);
    } catch (refreshError) {
      /**
       * The refresh request failed.
       *
       * Reject all requests waiting in the queue.
       */
      processQueue(refreshError);

      /**
       * Remove the invalid access token
       * from memory.
       */
      clearAccessToken();

      /**
       * The session is unrecoverable: send the user to the login page
       * when the failure happened on a protected route. Auth pages stay
       * untouched so inline errors (wrong OTP, etc.) keep rendering.
       */
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const onAuthPage =
          path === "/login" ||
          path === "/register" ||
          path === "/forget-password" ||
          path === "/verify-email" ||
          path === "/reset-password";

        if (!onAuthPage) {
          window.location.replace(
            `/login?redirect=${encodeURIComponent(path + window.location.search)}`,
          );
        }
      }

      /**
       * Reject with the original request error.
       *
       * The refresh failure is an internal
       * recovery detail; the caller needs the
       * message of the request it actually made
       * (e.g. "Invalid or expired reset code"),
       * not the refresh endpoint's error.
       */
      return Promise.reject(error);
    } finally {
      /**
       * Whether the refresh succeeded or failed,
       * allow future refresh requests.
       */
      isRefreshing = false;
    }
  },
);

/**
 * Export the Axios instance.
 *
 * All API services should use this instance:
 *
 * import api from "@/lib/axios";
 *
 * This ensures that all requests automatically
 * use the request and response interceptors.
 */
export default api;
