import { useState } from "react";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "./useNotes";
import type { Note } from "../../api/notes.api";

export const NotesPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading, error } = useNotes({ page, search: search || undefined, limit: 20 });
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const closeForm = () => {
    setEditingNote(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between border-b border-ink/10 pb-4">
        <h1 className="font-display text-2xl text-ink">Notes</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-signal px-3 py-1.5 font-sans text-sm text-paper hover:opacity-90"
        >
          New note
        </button>
      </div>

      {(isCreating || editingNote) && (
        <NoteForm
          note={editingNote}
          onCancel={closeForm}
          onSave={async (input) => {
            if (editingNote) {
              await updateNote.mutateAsync({ id: editingNote._id, input });
            } else {
              await createNote.mutateAsync(input as { title: string; content: string; problem?: string });
            }
            closeForm();
          }}
        />
      )}

      <input
        type="text"
        placeholder="Search by title"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-6 w-full max-w-sm border border-ink/20 bg-white px-3 py-1.5 font-sans text-sm text-ink focus:border-signal focus:outline-none"
      />

      {isLoading && <p className="font-sans text-sm text-ink/50">Loading notes…</p>}
      {error && <p className="font-sans text-sm text-rust">Couldn't load notes. Try refreshing.</p>}
      {data && data.notes.length === 0 && (
        <p className="font-sans text-sm text-ink/50">No notes yet. Start with "New note."</p>
      )}

      {data && data.notes.length > 0 && (
        <>
          <ul className="divide-y divide-ink/10 border-t border-ink/10">
            {data.notes.map((note) => (
              <li key={note._id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-medium text-ink">{note.title}</p>
                    {note.problem && (
                      <p className="mt-0.5 font-mono text-xs text-signal">↳ {note.problem.title}</p>
                    )}
                    <p className="mt-1 line-clamp-2 font-sans text-sm text-ink/60">{note.content}</p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      onClick={() => setEditingNote(note)}
                      className="font-sans text-xs text-ink/50 underline hover:text-signal"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${note.title}"?`)) deleteNote.mutate(note._id);
                      }}
                      className="font-sans text-xs text-ink/50 underline hover:text-rust"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="font-sans text-sm text-ink/70 underline disabled:text-ink/20 disabled:no-underline"
            >
              Previous
            </button>
            <p className="font-sans text-xs text-ink/40">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </p>
            <button
              disabled={data.pagination.page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="font-sans text-sm text-ink/70 underline disabled:text-ink/20 disabled:no-underline"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

interface NoteFormProps {
  note: Note | null;
  onCancel: () => void;
  onSave: (input: { title: string; content: string }) => Promise<void>;
}

const NoteForm = ({ note, onCancel, onSave }: NoteFormProps) => {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ title, content });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-6 border border-ink/20 bg-white p-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-2 w-full border-b border-ink/20 pb-2 font-sans text-sm text-ink focus:border-signal focus:outline-none"
      />
      <textarea
        placeholder="Write your note…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className="w-full font-sans text-sm text-ink focus:outline-none"
      />
      <div className="mt-3 flex justify-end gap-3">
        <button onClick={onCancel} className="font-sans text-sm text-ink/50 hover:text-ink">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-signal px-3 py-1.5 font-sans text-sm text-paper hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};