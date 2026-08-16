import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import { getParam } from "../../utils/getParam.js";
import * as problemService from "./problem.service.js";
import { listProblemsQuerySchema } from "./problem.validation.js";

export const listProblems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = listProblemsQuerySchema.parse(req.query);
  const result = await problemService.listProblems(req.user!.userId, query);
  res.status(200).json({ success: true, ...result });
});
export const createProblem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const problem = await problemService.createProblem(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: problem });
});



export const getProblem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const problem = await problemService.getProblemById(req.user!.userId, getParam(req.params.id));
  res.status(200).json({ success: true, data: problem });
});

export const updateProblem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const problem = await problemService.updateProblem(req.user!.userId, getParam(req.params.id), req.body);
  res.status(200).json({ success: true, data: problem });
});

export const deleteProblem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await problemService.deleteProblem(req.user!.userId, getParam(req.params.id));
  res.status(200).json({ success: true, message: "Problem deleted" });
});