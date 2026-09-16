import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreviewStudyPlan, useAcceptGeneratedPlan, useExplainResource } from "./useAi";
import { useNotes } from "../notes/useNotes";
import { useProblems } from "../problems/useProblems";
import type { AiPlanPreview } from "../../api/ai.api";

export const AiPage = () => {
  return (
    <div className="space-y-10">
      <h1 className="border-b border-ink/10 pb-4 font-display text-2xl text-ink">AI tools</h1>
      <StudyPlanGenerator />
      <ExplanationTool />
    </div>
  );
};

const StudyPlanGenerator = () => {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [preview, setPreview] = useState<AiPlanPreview | null>(null);

  const previewMutation = usePreviewStudyPlan();
  const acceptMutation = useAcceptGeneratedPlan();

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setPreview(null);
    const result = await previewMutation.mutateAsync({ goal: goal.trim(), durationDays });
    setPreview(result);
  };

  const handleAccept = async () => {
    if (!preview) return;
    await acceptMutation.mutateAsync({
      title: preview.title,
      tasks: preview.tasks.map((t) => ({ name: `Day ${t.day}: ${t.title} — ${t.description}` })),
    });
    navigate("/plans");
  };

  return (
    <section>
      <h2 className="mb-3 font-display text-lg text-ink">Study plan generator</h2>

      <div className="flex flex-wrap items-end gap-3 border border-ink/10 bg-white p-4">
        <div className="flex-1 min-w-[240px]">
          <label className="block font-sans text-xs text-ink/60">Goal</label>
          <input
            type="text"
            placeholder="e.g. SDE interview prep"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-1 w-full border-b border-ink/20 pb-1.5 font-sans text-sm text-ink focus:border-signal focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-sans text-xs text-ink/60">Days</label>
          <input
            type="number"
            min={1}
            max={90}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="mt-1 w-20 border-b border-ink/20 pb-1.5 font-sans text-sm text-ink focus:border-signal focus:outline-none"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={previewMutation.isPending}
          className="bg-signal px-4 py-2 font-sans text-sm text-paper hover:opacity-90 disabled:opacity-50"
        >
          {previewMutation.isPending ? "Generating…" : "Generate"}
        </button>
      </div>

      {previewMutation.isError && (
        <p className="mt-3 font-sans text-sm text-rust">
          Couldn't generate a plan right now — try again in a moment.
        </p>
      )}

      {preview && (
        <div className="mt-4 border border-ink/10 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base text-ink">{preview.title}</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setPreview(null)}
                className="font-sans text-sm text-ink/50 hover:text-ink"
              >
                Discard
              </button>
              <button
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
                className="bg-signal px-3 py-1.5 font-sans text-sm text-paper hover:opacity-90 disabled:opacity-50"
              >
                {acceptMutation.isPending ? "Saving…" : "Accept & save"}
              </button>
            </div>
          </div>
          <ul className="space-y-2">
            {preview.tasks.map((task) => (
              <li key={task.day} className="font-sans text-sm">
                <span className="font-mono text-xs text-signal">Day {task.day}</span>{" "}
                <span className="font-medium text-ink">{task.title}</span>
                <p className="text-ink/60">{task.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

const ExplanationTool = () => {
  const [resourceType, setResourceType] = useState<"note" | "problem">("note");
  const [resourceId, setResourceId] = useState("");

  const { data: notes } = useNotes({ limit: 100 });
  const { data: problems } = useProblems({ limit: 100 });

  const explainMutation = useExplainResource();

  const handleExplain = async () => {
    if (!resourceId) return;
    await explainMutation.mutateAsync({ resourceType, resourceId });
  };

  const options = resourceType === "note" ? notes?.notes : problems?.problems;

  return (
    <section>
      <h2 className="mb-3 font-display text-lg text-ink">Explain a note or problem</h2>

      <div className="flex flex-wrap items-end gap-3 border border-ink/10 bg-white p-4">
        <div>
          <label className="block font-sans text-xs text-ink/60">Type</label>
          <select
            value={resourceType}
            onChange={(e) => {
              setResourceType(e.target.value as "note" | "problem");
              setResourceId("");
            }}
            className="mt-1 border-b border-ink/20 pb-1.5 font-sans text-sm text-ink focus:border-signal focus:outline-none"
          >
            <option value="note">Note</option>
            <option value="problem">Problem</option>
          </select>
        </div>
        <div className="flex-1 min-w-[240px]">
          <label className="block font-sans text-xs text-ink/60">
            {resourceType === "note" ? "Note" : "Problem"}
          </label>
          <select
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            className="mt-1 w-full border-b border-ink/20 pb-1.5 font-sans text-sm text-ink focus:border-signal focus:outline-none"
          >
            <option value="">Select…</option>
            {options?.map((item) => (
              <option key={item._id} value={item._id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleExplain}
          disabled={!resourceId || explainMutation.isPending}
          className="bg-signal px-4 py-2 font-sans text-sm text-paper hover:opacity-90 disabled:opacity-50"
        >
          {explainMutation.isPending ? "Explaining…" : "Explain"}
        </button>
      </div>

      {explainMutation.isError && (
        <p className="mt-3 font-sans text-sm text-rust">
          Couldn't generate an explanation right now — try again in a moment.
        </p>
      )}

      {explainMutation.data && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ExplanationBlock title="Explanation" content={explainMutation.data.explanation} />
          <ExplanationBlock title="Intuition" content={explainMutation.data.intuition} />
          <ExplanationBlock title="Complexity" content={explainMutation.data.complexity} />
          <div className="border border-ink/10 bg-white p-4">
            <h4 className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-ink/50">
              Common mistakes
            </h4>
            <ul className="list-disc space-y-1 pl-4 font-sans text-sm text-ink/80">
              {explainMutation.data.commonMistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

const ExplanationBlock = ({ title, content }: { title: string; content: string }) => (
  <div className="border border-ink/10 bg-white p-4">
    <h4 className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-ink/50">{title}</h4>
    <p className="whitespace-pre-wrap font-sans text-sm text-ink/80">{content}</p>
  </div>
);