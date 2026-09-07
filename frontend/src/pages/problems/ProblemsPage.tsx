import { useState } from "react";
import { useProblems, useUpdateProblemStatus, useDeleteProblem } from "./useProblems";
import type { ProblemFilters, Problem } from "../../api/problems.api";

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
  const { data, isLoading, error } = useProblems(filters);
  const updateStatus = useUpdateProblemStatus();
  const deleteProblemMutation = useDeleteProblem();

  const updateFilter = (patch: Partial<ProblemFilters>) => {
    // Any filter change resets to page 1 — otherwise you could land on
    // "page 4" of a filtered set that only has 1 page, showing nothing.
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between border-b border-ink/10 pb-4">
        <h1 className="font-display text-2xl text-ink">Problems</h1>
        {data && (
          <p className="font-sans text-sm text-ink/50">{data.pagination.total} total</p>
        )}
      </div>

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
        <p className="font-sans text-sm text-rust">
          Couldn't load problems. Try refreshing the page.
        </p>
      )}

      {data && data.problems.length === 0 && (
        <p className="font-sans text-sm text-ink/50">
          No problems match these filters yet.
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
                    {problem.topic} · <span className={difficultyColor[problem.difficulty]}>{problem.difficulty}</span>
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