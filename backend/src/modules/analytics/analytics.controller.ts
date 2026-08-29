import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import * as analyticsService from "./analytics.service.js";

export const getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await analyticsService.getDashboardStats(req.user!.userId);
  res.status(200).json({ success: true, data: stats });
});