import { useState, type FormEvent } from "react";
import { useProblems, useUpdateProblemStatus, useDeleteProblem, useCreateProblem } from "./useProblems";
import type { ProblemFilters, Problem } from "../../api/problems.api";
import { getApiErrorMessage } from "../../lib/apiError";

const difficultyColor: Record<Problem["difficulty"], string> = {
  easy: "text-signal",
  medium: "text-ink/70",
  hard: "text-rust",
};

const statusLabel: Record<Problem["status"], string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  solved: "Solved",
};

export const ProblemsPage = () => {
  const [filters, setFilters] = useState<ProblemFilters>({ page: 1, limit: 20 });
  const [isAdding, setIsAdding] = useState(false);
  const { data, isLoading, error } = useProblems(filters);
  const updateStatus = useUpdateProblemStatus();
  const deleteProblemMutation = useDeleteProblem();

  const updateFilter = (patch: Partial<ProblemFilters>) => {
    // Any filter change resets to page 1, otherwise you could land on
    // "page 4" of a filtered set that only has one page.
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between border-b border-ink/10 pb-4">
        <h1 className="font-display text-2xl text-ink">Problems</h1>
        <div className="flex items-baseline gap-4">
          {data && <p className="font-sans text-sm text-ink/50">{data.pagination.total} total</p>}
          <button
            onClick={() => setIsAdding(true)}
            className="bg-signal px-3 py-1.5 font-sans text-sm text-paper hover:opacity-90"
          >
            Add problem
          </button>
        </div>
      </div>

      {isAdding && <AddProblemForm onDone={() => setIsAdding(false)} />}

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by title"
          onChange={(e) => updateFilter({ search: e.target.value || undefined })}
          className="border border-ink/20 bg-white px-3 py-1.5 font-sans text-sm text-ink focus:border-signal focus:outline-none"
        />
        <select
          onChange={(e) => updateFilter({ difficulty: (e.target.value || undefined) as ProblemFilters["difficulty"] })}
          className="border border-ink/20 bg-white px-3 py-1.5 font-sans text-sm text-ink focus:border-signal focus:outline-none"
        >
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          onChange={(e) => updateFilter({ status: (e.target.value || undefined) as ProblemFilters["status"] })}
          className="border border-ink/20 bg-white px-3 py-1.5 font-sans text-sm text-ink focus:border-signal focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="not-started">Not started</option>
          <option value="in-progress">In progress</option>
          <option value="solved">Solved</option>
        </select>
      </div>

      {isLoading && <p className="font-sans text-sm text-ink/50">Loading problems…</p>}

      {error && (
        <p className="font-sans text-sm text-rust">Couldn't load problems. Try refreshing the page.</p>
      )}

      {data && data.problems.length === 0 && (
        <p className="font-sans text-sm text-ink/50">
          No problems match these filters yet. Use "Add problem" to create one.
        </p>
      )}

      {data && data.problems.length > 0 && (
        <>
          <ul className="divide-y divide-ink/10 border-t border-ink/10">
            {data.problems.map((problem) => (
              <li key={problem._id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-sans text-sm text-ink">
                    {problem.link ? (
                      <a href={problem.link} target="_blank" rel="noreferrer" className="hover:underline">
                        {problem.title}
                      </a>
                    ) : (
                      problem.title
                    )}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ink/40">
                    {problem.topic} ·{" "}
                    <span className={difficultyColor[problem.difficulty]}>{problem.difficulty}</span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <select
                    value={problem.status}
                    onChange={(e) =>
                      updateStatus.mutate({ id: problem._id, status: e.target.value as Problem["status"] })
                    }
                    className="border border-ink/20 bg-white px-2 py-1 font-sans text-xs text-ink focus:border-signal focus:outline-none"
                  >
                    <option value="not-started">{statusLabel["not-started"]}</option>
                    <option value="in-progress">{statusLabel["in-progress"]}</option>
                    <option value="solved">{statusLabel.solved}</option>
                  </select>

                  <button
                    onClick={() => {
                      if (confirm(`Delete "${problem.title}"?`)) {
                        deleteProblemMutation.mutate(problem._id);
                      }
                    }}
                    className="font-sans text-xs text-ink/40 hover:text-rust"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
              className="font-sans text-sm text-ink/70 underline disabled:text-ink/20 disabled:no-underline"
            >
              Previous
            </button>
            <p className="font-sans text-xs text-ink/40">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </p>
            <button
              disabled={data.pagination.page >= data.pagination.totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
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

const AddProblemForm = ({ onDone }: { onDone: () => void }) => {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Problem["difficulty"]>("easy");
  const [topic, setTopic] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createProblem = useCreateProblem();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !topic.trim()) {
      setError("Title and topic are required.");
      return;
    }

    try {
      await createProblem.mutateAsync({
        title: title.trim(),
        difficulty,
        topic: topic.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        link: link.trim() || undefined, // the API rejects an empty string as a URL
      });
      onDone();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const inputClass =
    "w-full border-b border-ink/20 pb-1.5 font-sans text-sm text-ink focus:border-signal focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="mb-6 border border-ink/20 bg-white p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block font-sans text-xs text-ink/60">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Two Sum"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-sans text-xs text-ink/60">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Arrays"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-sans text-xs text-ink/60">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Problem["difficulty"])}
            className={inputClass}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block font-sans text-xs text-ink/60">Tags (comma separated, optional)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="hashmap, two-pointers"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-sans text-xs text-ink/60">Link (optional)</label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://leetcode.com/problems/two-sum"
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="mt-3 font-sans text-sm text-rust">{error}</p>}

      <div className="mt-4 flex justify-end gap-3">
        <button type="button" onClick={onDone} className="font-sans text-sm text-ink/50 hover:text-ink">
          Cancel
        </button>
        <button
          type="submit"
          disabled={createProblem.isPending}
          className="bg-signal px-3 py-1.5 font-sans text-sm text-paper hover:opacity-90 disabled:opacity-50"
        >
          {createProblem.isPending ? "Adding…" : "Add problem"}
        </button>
      </div>
    </form>
  );
};