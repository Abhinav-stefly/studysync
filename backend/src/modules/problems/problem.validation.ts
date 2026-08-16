import { z } from "zod";

export const createProblemSchema = z.object({
  title: z.string().min(1).max(200),
  difficulty: z.enum(["easy", "medium", "hard"]),
  topic: z.string().min(1).max(50),
  tags: z.array(z.string()).optional(),
  link: z.url().optional(),
});

export const updateProblemSchema = createProblemSchema.partial().extend({
  status: z.enum(["not-started", "in-progress", "solved"]).optional(),
});

export const listProblemsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  topic: z.string().optional(),
  status: z.enum(["not-started", "in-progress", "solved"]).optional(),
  search: z.string().optional(),
  sort: z.string().optional().default("-createdAt"),
});

export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;
export type ListProblemsQuery = z.infer<typeof listProblemsQuerySchema>;