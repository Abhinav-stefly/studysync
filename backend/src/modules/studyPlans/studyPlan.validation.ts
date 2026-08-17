import { z } from "zod";

const taskInputSchema = z.object({
  name: z.string().min(1).max(100),
  completed: z.boolean().optional().default(false),
  deadline: z.coerce.date().optional(),
});

export const createStudyPlanSchema = z.object({
  title: z.string().min(1).max(200),
  tasks: z.array(taskInputSchema).min(1),
});

export const updateStudyPlanSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export const updateTaskSchema = z.object({
  completed: z.boolean(),
});

export type CreateStudyPlanInput = z.infer<typeof createStudyPlanSchema>;
export type UpdateStudyPlanInput = z.infer<typeof updateStudyPlanSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;