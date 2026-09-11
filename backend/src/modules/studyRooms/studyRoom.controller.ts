// studyRoom.controller.ts
import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import { getParam } from "../../utils/getParam.js";
import { isRoomMember, getRoomMessages } from "./studyRoom.service.js";
import { AppError } from "../../middleware/errorHandler.js";

export const getMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const roomId = getParam(req.params.id);
  const isMember = await isRoomMember(roomId, req.user!.userId);
  if (!isMember) {
    throw new AppError("Not a member of this room", 403);
  }
  const messages = await getRoomMessages(roomId);
  res.status(200).json({ success: true, data: messages });
});

import { createStudyRoomSchema } from "./studyRoom.validation.js";
import { createStudyRoom, listStudyRooms, joinStudyRoom } from "./studyRoom.service.js";

export const createRoom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = createStudyRoomSchema.parse(req.body);
  const room = await createStudyRoom(req.user!.userId, input);
  res.status(201).json({ success: true, data: room });
});

export const listRooms = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const rooms = await listStudyRooms(req.user!.userId);
  res.status(200).json({ success: true, data: rooms });
});

export const joinRoom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const room = await joinStudyRoom(req.user!.userId, getParam(req.params.id));
  res.status(200).json({ success: true, data: room });
});