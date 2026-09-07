import { axiosClient } from "./axiosClient";

export interface Note {
  _id: string;
  title: string;
  content: string;
  problem?: { _id: string; title: string } | null; // populated, may be null/undefined if unlinked
  createdAt: string;
  updatedAt: string;
}

export interface NoteFilters {
  page?: number;
  limit?: number;
  search?: string;
  problem?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface NotesResponse {
  notes: Note[];
  pagination: Pagination;
}

export const fetchNotes = async (filters: NoteFilters): Promise<NotesResponse> => {
  const { data } = await axiosClient.get("/notes", { params: filters });
  const { success, ...result } = data;
  return result as NotesResponse;
};

export const createNote = async (input: { title: string; content: string; problem?: string }): Promise<Note> => {
  const { data } = await axiosClient.post("/notes", input);
  return data.data;
};

export const updateNote = async (
  id: string,
  input: Partial<{ title: string; content: string; problem: string }>
): Promise<Note> => {
  const { data } = await axiosClient.patch(`/notes/${id}`, input);
  return data.data;
};

export const deleteNote = async (id: string): Promise<void> => {
  await axiosClient.delete(`/notes/${id}`);
};