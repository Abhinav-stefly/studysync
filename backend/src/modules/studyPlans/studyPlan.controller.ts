import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import { getParam } from "../../utils/getParam.js";
import * as studyPlanService from "./studyPlan.service.js";

export const createStudyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const plan = await studyPlanService.createStudyPlan(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: plan });
});

export const listStudyPlans = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const plans = await studyPlanService.listStudyPlans(req.user!.userId);
  res.status(200).json({ success: true, data: plans });
});

export const getStudyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const plan = await studyPlanService.getStudyPlanById(req.user!.userId, getParam(req.params.id));
  res.status(200).json({ success: true, data: plan });
});

export const updateStudyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const plan = await studyPlanService.updateStudyPlan(req.user!.userId, getParam(req.params.id), req.body);
  res.status(200).json({ success: true, data: plan });
});

export const deleteStudyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await studyPlanService.deleteStudyPlan(req.user!.userId, getParam(req.params.id));
  res.status(200).json({ success: true, message: "Study plan deleted" });
});

export const updateTaskStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const plan = await studyPlanService.updateTaskStatus(
    req.user!.userId,
    getParam(req.params.id),
    getParam(req.params.taskId),
    req.body
  );
  res.status(200).json({ success: true, data: plan });
});