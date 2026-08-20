import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, Stat, Bar } from "@/components/Shell";
import { ShowMeHow } from "@/components/ShowMeHow";
import { loadSessions, type SavedSession } from "@/lib/store";
import { getExercise } from "@/lib/pose/analysis";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Session Summary — MOTIONMATE" },
      {
        name: "description",
        content:
          "Review reps, form score, biomechanical breakdown, fatigue drift and movement corrections from your last session.",
      },
      { property: "og:title", content: "Session Summary — MOTIONMATE" },
      {
        property: "og:description",
        content: "Reps, form score and corrections from your last session.",
      },
    ],
  }),
  component: Summary,
});

function Summary() {
  const [session, setSession] = useState<SavedSession | null>(null);
  useEffect(() => setSession(loadSessions()[0] ?? null), []);

  if (!session) {
    return (
      <Shell>
        <div className="panel p-10 text-center">
          <h1 className="font-display text-2xl font-bold">No session yet</h1>
          <p className="mt-2 text-muted-foreground">
            Finish a camera session to see your summary here.
          </p>
          <Link
            to="/exercises"
            className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Start training
          </Link>
        </div>
      </Shell>
    );
  }

  const ex = getExercise(session.exerciseId);
  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            {session.mode === "offline" ? "Offline session" : "Live session"}
          </p>
          <h1 className="text-3xl font-extrabold">{session.exerciseName} summary</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(session.date).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/train/$exercise"
            params={{ exercise: session.exerciseId }}
            className="flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-secondary"
          >
            Train again
          </Link>
          <Link
            to="/progress"
            className="flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            View progress
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={ex.isHold ? "Hold time" : "Reps"}
          value={ex.isHold ? `${session.holdSeconds}s` : session.reps}
        />
        <Stat label="Form score" value={session.score} />
        <Stat
          label="Fatigue drift"
          value={session.fatigue > 0 ? `−${session.fatigue}` : "Stable"}
          sub="Consistency across reps"
        />
        <Stat
          label="Best rep"
          value={session.repScores.length ? Math.max(...session.repScores) : "—"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="font-display text-lg font-bold">Biomechanical breakdown</h2>
          <div className="mt-5 space-y-4">
            <Bar label="Posture" value={session.posture} />
            <Bar label="Balance" value={session.balance} />
            <Bar label="Alignment" value={session.alignment} />
            <Bar label="Depth" value={session.depth} />
            <Bar label="Cadence" value={session.cadence} />
          </div>
        </div>
        <div className="panel p-6">
          <h2 className="font-display text-lg font-bold">Rep-by-rep form</h2>
          <div className="mt-6 flex h-40 items-end gap-1.5">
            {session.repScores.length ? (
              session.repScores.map((s, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/80"
                  style={{ height: `${Math.max(6, s)}%` }}
                  title={`Rep ${i + 1}: ${s}`}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No completed reps recorded.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ShowMeHow
          yourPose={{ knee: ex.targetDepth + 22, torso: 20, elbow: 150 }}
          targetPose={{ knee: ex.targetDepth, torso: 8, elbow: 160 }}
          correction={
            session.depth < 75
              ? `Depth stopped ~20° short of the ${ex.targetDepth}° target. Slow the descent and pause at the bottom.`
              : "Depth on target — keep torso angle within 10° of vertical."
          }
        />
      </div>
    </Shell>
  );
}
