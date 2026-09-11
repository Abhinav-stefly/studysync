import { StudyRoom } from "./studyRoom.model.js";
import { RoomMessage } from "./roomMessage.model.js";
import { AppError } from "../../middleware/errorHandler.js";
import mongoose from "mongoose";
import { CreateStudyRoomInput } from "./studyRoom.validation.js";

export const isRoomMember = async (roomId: string, userId: string): Promise<boolean> => {
  const room = await StudyRoom.findOne({ _id: roomId, members: userId });
  return !!room;
};

export const createMessage = async (roomId: string, userId: string, content: string) => {
  return RoomMessage.create({ roomId, userId, content });
};

export const getRoomMessages = async (roomId: string, limit = 50) => {
  return RoomMessage.find({ roomId }).sort("-createdAt").limit(limit);
};

export const createStudyRoom = async (userId: string, input: CreateStudyRoomInput) => {
  return StudyRoom.create({
    name: input.name,
    createdBy: userId,
    members: [userId], // creator is automatically the first member
  });
};

export const listStudyRooms = async (userId: string) => {
  const rooms = await StudyRoom.find().sort("-createdAt");
  // Annotate each room with membership, without changing the stored shape —
  // this is presentation logic (what THIS user can do with THIS room),
  // not something that belongs on the document itself.
  return rooms.map((room) => ({
    ...room.toObject(),
    isMember: room.members.some((m) => m.toString() === userId),
  }));
};

export const joinStudyRoom = async (userId: string, roomId: string) => {
  const room = await StudyRoom.findById(roomId);
  if (!room) {
    throw new AppError("Study room not found", 404);
  }

  const alreadyMember = room.members.some((m) => m.toString() === userId);
  if (!alreadyMember) {
    room.members.push(new mongoose.Types.ObjectId(userId));
    await room.save();
  }

  return room;
};