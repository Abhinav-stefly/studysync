import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import { getParam } from "../../utils/getParam.js";
import { listNotesQuerySchema } from "./note.validation.js";
import * as noteService from "./note.service.js";

export const createNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const note = await noteService.createNote(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: note });
});

export const listNotes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = listNotesQuerySchema.parse(req.query);
  const result = await noteService.listNotes(req.user!.userId, query);
  res.status(200).json({ success: true, ...result });
});

export const getNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const note = await noteService.getNoteById(req.user!.userId, getParam(req.params.id));
  res.status(200).json({ success: true, data: note });
});

export const updateNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const note = await noteService.updateNote(req.user!.userId, getParam(req.params.id), req.body);
  res.status(200).json({ success: true, data: note });
});

export const deleteNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await noteService.deleteNote(req.user!.userId, getParam(req.params.id));
  res.status(200).json({ success: true, message: "Note deleted" });
});