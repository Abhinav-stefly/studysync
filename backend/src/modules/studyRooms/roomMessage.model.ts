import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRoomMessage extends Document {
  roomId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const roomMessageSchema = new Schema<IRoomMessage>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "StudyRoom", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Messages are always fetched "for this room, newest/oldest order" —
// compound index mirrors that exact access pattern.
roomMessageSchema.index({ roomId: 1, createdAt: 1 });

export const RoomMessage = mongoose.model<IRoomMessage>("RoomMessage", roomMessageSchema);