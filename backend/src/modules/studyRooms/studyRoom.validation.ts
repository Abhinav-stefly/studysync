import { z } from "zod";

export const createStudyRoomSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export type CreateStudyRoomInput = z.infer<typeof createStudyRoomSchema>;