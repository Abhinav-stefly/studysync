// backend/src/modules/studyPlans/studyPlan.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

interface ITask {
  name: string;
  completed: boolean;
  deadline?: Date;
}

export interface IStudyPlan extends Document {
  userId: Types.ObjectId;
  title: string;
  tasks: ITask[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    name: { type: String, required: true },
    completed: { type: Boolean, default: false },
    deadline: { type: Date },
  },
  { _id: true }
);

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    tasks: [taskSchema],
  },
  { timestamps: true }
);

export const StudyPlan = mongoose.model<IStudyPlan>("StudyPlan", studyPlanSchema);