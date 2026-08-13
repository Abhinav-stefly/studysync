// backend/src/modules/problems/problem.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProblem extends Document {
  userId: Types.ObjectId;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  tags: string[];
  status: "not-started" | "in-progress" | "solved";
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    topic: { type: String, required: true, index: true },
    tags: [{ type: String }],
    status: { type: String, enum: ["not-started", "in-progress", "solved"], default: "not-started" },
    link: { type: String },
  },
  { timestamps: true }
);

// Compound index: our most common real query pattern is
// "this user's problems, filtered by difficulty/status"
problemSchema.index({ userId: 1, difficulty: 1 });
problemSchema.index({ userId: 1, status: 1 });

export const Problem = mongoose.model<IProblem>("Problem", problemSchema);