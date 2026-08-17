import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  problem: z.string().optional(), // ObjectId as string, optional link to a Problem
});

export const updateNoteSchema = createNoteSchema.partial();

export const listNotesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  problem: z.string().optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;