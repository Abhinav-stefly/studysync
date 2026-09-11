import { useState } from "react";
import {
  useStudyPlans,
  useCreateStudyPlan,
  useDeleteStudyPlan,
  useUpdateTaskStatus,
} from "./useStudyPlans";
import type { StudyPlan } from "../../api/studyPlans.api";

export const StudyPlansPage = () => {
  const { data: plans, isLoading, error } = useStudyPlans();
  const deletePlan = useDeleteStudyPlan();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between border-b border-ink/10 pb-4">
        <h1 className="font-display text-2xl text-ink">Study plans</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-signal px-3 py-1.5 font-sans text-sm text-paper hover:opacity-90"
        >
          New plan
        </button>
      </div>

      {isCreating && <CreatePlanForm onDone={() => setIsCreating(false)} />}

      {isLoading && <p className="font-sans text-sm text-ink/50">Loading plans…</p>}
      {error && <p className="font-sans text-sm text-rust">Couldn't load study plans.</p>}
      {plans && plans.length === 0 && !isCreating && (
        <p className="font-sans text-sm text-ink/50">No study plans yet. Start with "New plan."</p>
      )}

      <div className="space-y-6">
        {plans?.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            onDelete={() => {
              if (confirm(`Delete "${plan.title}"?`)) deletePlan.mutate(plan._id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

const PlanCard = ({ plan, onDelete }: { plan: StudyPlan; onDelete: () => void }) => {
  const updateTask = useUpdateTaskStatus();

  return (
    <div className="border border-ink/10 bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg text-ink">{plan.title}</h2>
          <p className="font-sans text-xs text-ink/50">
            {plan.completedCount} of {plan.totalCount} tasks done
          </p>
        </div>
        <button onClick={onDelete} className="font-sans text-xs text-ink/40 hover:text-rust">
          Delete
        </button>
      </div>

      {/* Progress bar — functional feedback, not decoration */}
      <div className="mb-4 h-1.5 w-full bg-ink/10">
        <div
          className="h-full bg-signal transition-all"
          style={{ width: `${plan.progress}%` }}
        />
      </div>

      <ul className="space-y-2">
        {plan.tasks.map((task) => (
          <li key={task._id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) =>
                updateTask.mutate({ planId: plan._id, taskId: task._id, completed: e.target.checked })
              }
              className="h-4 w-4 accent-signal"
            />
            <span className={`font-sans text-sm ${task.completed ? "text-ink/40 line-through" : "text-ink"}`}>
              {task.name}
            </span>
            {task.deadline && (
              <span className="ml-auto font-mono text-xs text-ink/40">
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const CreatePlanForm = ({ onDone }: { onDone: () => void }) => {
  const [title, setTitle] = useState("");
  const [taskNames, setTaskNames] = useState("");
  const createPlan = useCreateStudyPlan();

  const handleSubmit = async () => {
    const tasks = taskNames
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    if (!title.trim() || tasks.length === 0) return;

    await createPlan.mutateAsync({ title, tasks });
    onDone();
  };

  return (
    <div className="mb-6 border border-ink/20 bg-white p-4">
      <input
        type="text"
        placeholder="Plan title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-3 w-full border-b border-ink/20 pb-2 font-sans text-sm text-ink focus:border-signal focus:outline-none"
      />
      <textarea
        placeholder={"One task per line, e.g.\nReview arrays and hashmaps\nSolve 5 medium problems"}
        value={taskNames}
        onChange={(e) => setTaskNames(e.target.value)}
        rows={5}
        className="w-full font-sans text-sm text-ink focus:outline-none"
      />
      <div className="mt-3 flex justify-end gap-3">
        <button onClick={onDone} className="font-sans text-sm text-ink/50 hover:text-ink">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={createPlan.isPending}
          className="bg-signal px-3 py-1.5 font-sans text-sm text-paper hover:opacity-90 disabled:opacity-50"
        >
          {createPlan.isPending ? "Creating…" : "Create plan"}
        </button>
      </div>
    </div>
  );
};