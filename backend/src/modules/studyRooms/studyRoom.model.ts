// backend/src/modules/studyRooms/studyRoom.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStudyRoom extends Document {
  name: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const studyRoomSchema = new Schema<IStudyRoom>(
  {
    name: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const StudyRoom = mongoose.model<IStudyRoom>("StudyRoom", studyRoomSchema);