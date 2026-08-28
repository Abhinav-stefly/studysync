import { Note } from "./note.model.js";
import { AppError } from "../../middleware/errorHandler.js";
import { CreateNoteInput, UpdateNoteInput, ListNotesQuery } from "./note.validation.js";

export const createNote = async (userId: string, input: CreateNoteInput) => {
  return Note.create({ ...input, userId });
};

export const listNotes = async (userId: string, query: ListNotesQuery) => {
  const { page, limit, search, problem } = query;

  const filter: Record<string, unknown> = { userId };
  if (problem) filter.problem = problem;
  if (search) filter.title = { $regex: search, $options: "i" };

  const skip = (page - 1) * limit;

  const [notes, total] = await Promise.all([
    Note.find(filter).sort("-createdAt").skip(skip).limit(limit),
    Note.countDocuments(filter),
  ]);

  return {
    notes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getNoteById = async (userId: string, noteId: string) => {
  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) {
    throw new AppError("Note not found", 404);
  }
  return note;
};

export const updateNote = async (userId: string, noteId: string, input: UpdateNoteInput) => {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId },
    { $set: input },
    {returnDocument: "after", runValidators: true }
  );
  if (!note) {
    throw new AppError("Note not found", 404);
  }
  return note;
};

export const deleteNote = async (userId: string, noteId: string) => {
  const note = await Note.findOneAndDelete({ _id: noteId, userId });
  if (!note) {
    throw new AppError("Note not found", 404);
  }
  return note;
};