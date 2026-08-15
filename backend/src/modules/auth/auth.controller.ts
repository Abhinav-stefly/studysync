import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { registerUser, loginUser } from "./auth.service.js";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in ms
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json({ success: true, data: { user, accessToken } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json({ success: true, data: { user, accessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});