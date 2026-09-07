import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the httpOnly refresh cookie on every request
});

// In-memory token storage — a plain variable, not React state, because
// this file isn't a component and can't use hooks. AuthContext (next step)
// will be the source of truth for UI purposes; this is just where the
// interceptor reads the CURRENT token at request time.
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

axiosClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: (() => void)[] = [];

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // A refresh is already in flight (e.g. two requests failed at once) —
        // queue this request to retry once that refresh finishes, instead of
        // firing a second parallel refresh call.
        return new Promise((resolve) => {
          refreshQueue.push(() => resolve(axiosClient(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axiosClient.post("/auth/refresh");
        setAccessToken(data.accessToken);
        isRefreshing = false;
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshQueue = [];
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);