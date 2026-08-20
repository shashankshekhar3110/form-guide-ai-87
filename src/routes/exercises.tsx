import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { EXERCISES } from "@/lib/pose/analysis";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: [
      { title: "Choose an Exercise — MOTIONMATE" },
      {
        name: "description",
        content:
          "Pick squat, push-up, bicep curl, overhead press, deadlift, lunge or plank and start a live camera coaching session.",
      },
      { property: "og:title", content: "Choose an Exercise — MOTIONMATE" },
      {
        property: "og:description",
        content: "Seven tracked movements with live joint-angle analysis.",
      },
    ],
  }),
  component: ExercisePicker,
});

function ExercisePicker() {
  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Choose an exercise</h1>
      <p className="mt-2 text-muted-foreground">
        Each movement uses its own joint-angle model for rep detection and scoring.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXERCISES.map((e) => (
          <Link
            key={e.id}
            to="/train/$exercise"
            params={{ exercise: e.id }}
            className="panel group p-5 transition-shadow hover:shadow-lift"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-display text-lg font-bold">{e.name}</h2>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {e.isHold ? "Hold" : "Reps"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{e.focus}</p>
            <p className="mt-4 text-sm">{e.cue}</p>
            <p className="mt-4 text-sm font-semibold text-primary group-hover:underline">
              Start session →
            </p>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
