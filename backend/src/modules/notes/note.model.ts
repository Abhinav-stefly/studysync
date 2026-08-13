// backend/src/modules/notes/note.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface INote extends Document {
  userId: Types.ObjectId;
  problem?: Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem" },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>("Note", noteSchema);