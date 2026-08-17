import { StudyPlan } from "./studyPlan.model.js";
import { AppError } from "../../middleware/errorHandler.js";
import { CreateStudyPlanInput, UpdateStudyPlanInput, UpdateTaskInput } from "./studyPlan.validation.js";

const withProgress = (plan: any) => {
  const total = plan.tasks.length;
  const completed = plan.tasks.filter((t: any) => t.completed).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    ...plan.toObject(),
    progress,
    completedCount: completed,
    totalCount: total,
  };
};

export const createStudyPlan = async (userId: string, input: CreateStudyPlanInput) => {
  const plan = await StudyPlan.create({ ...input, userId });
  return withProgress(plan);
};

export const listStudyPlans = async (userId: string) => {
  const plans = await StudyPlan.find({ userId }).sort("-createdAt");
  return plans.map(withProgress);
};

export const getStudyPlanById = async (userId: string, planId: string) => {
  const plan = await StudyPlan.findOne({ _id: planId, userId });
  if (!plan) {
    throw new AppError("Study plan not found", 404);
  }
  return withProgress(plan);
};

export const updateStudyPlan = async (userId: string, planId: string, input: UpdateStudyPlanInput) => {
  const plan = await StudyPlan.findOneAndUpdate(
    { _id: planId, userId },
    { $set: input },
    { new: true, runValidators: true }
  );
  if (!plan) {
    throw new AppError("Study plan not found", 404);
  }
  return withProgress(plan);
};

export const deleteStudyPlan = async (userId: string, planId: string) => {
  const plan = await StudyPlan.findOneAndDelete({ _id: planId, userId });
  if (!plan) {
    throw new AppError("Study plan not found", 404);
  }
  return plan;
};

export const updateTaskStatus = async (
  userId: string,
  planId: string,
  taskId: string,
  input: UpdateTaskInput
) => {
  const plan = await StudyPlan.findOne({ _id: planId, userId });
  if (!plan) {
    throw new AppError("Study plan not found", 404);
  }

  const task = plan.tasks.id(taskId);
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  task.completed = input.completed;
  await plan.save();

  return withProgress(plan);
};