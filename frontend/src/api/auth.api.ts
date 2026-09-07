import { axiosClient } from "./axiosClient";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

export const loginRequest = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await axiosClient.post("/auth/login", { email, password });
  return data.data; // adjust if your backend's response envelope differs
};

export const registerRequest = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await axiosClient.post("/auth/register", { name, email, password });
  return data.data;
};

export const logoutRequest = async (): Promise<void> => {
  await axiosClient.post("/auth/logout");
};

export const refreshRequest = async (): Promise<AuthResponse> => {
  const { data } = await axiosClient.post("/auth/refresh");
  return data.data;
};