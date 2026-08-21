import { StudyRoom } from "./studyRoom.model.js";
import { RoomMessage } from "./roomMessage.model.js";
import { AppError } from "../../middleware/errorHandler.js";

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