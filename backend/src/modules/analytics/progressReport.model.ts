import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProgressReport extends Document {
  userId: Types.ObjectId;
  weekStart: Date;
  weekEnd: Date;
  problemsSolved: number;
  studyHours: number;
  completionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const progressReportSchema = new Schema<IProgressReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    problemsSolved: { type: Number, default: 0 },
    studyHours: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One report per user per week — this compound unique index is what makes
// our upsert-based idempotency actually enforceable at the database level,
// not just "hopefully correct" in application code.
progressReportSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export const ProgressReport = mongoose.model<IProgressReport>("ProgressReport", progressReportSchema);