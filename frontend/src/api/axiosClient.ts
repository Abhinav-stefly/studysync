import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the httpOnly refresh cookie
});

// In-memory only: a plain variable, because the interceptors below run outside
// React. AuthContext keeps it in sync with the user state.
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

axiosClient.interceptors.request.use((config) => {
  // Runs again on a retried request, so it overwrites the stale token
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// These endpoints answer 401 as a normal outcome (wrong password, no session).
// Retrying them through a refresh would loop or hide the real error.
const NO_REFRESH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

// All requests that fail while a refresh is running wait on this one promise.
let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = (): Promise<void> => {
  if (!refreshPromise) {
    refreshPromise = axiosClient
      .post("/auth/refresh")
      .then((res) => {
        setAccessToken(res.data.data.accessToken as string);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthRequest = NO_REFRESH_PATHS.some((p) => original?.url?.includes(p));

    if (error.response?.status === 401 && original && !original._retry && !isAuthRequest) {
      original._retry = true; // at most one retry per request
      try {
        await refreshAccessToken();
        return axiosClient(original);
      } catch (refreshError) {
        setAccessToken(null);
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);