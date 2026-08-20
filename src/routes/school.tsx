import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Stat } from "@/components/Shell";
import { SCHOOL_LANES } from "@/lib/store";

export const Route = createFileRoute("/school")({
  head: () => ({
    meta: [
      { title: "School Mode — MOTIONMATE" },
      {
        name: "description",
        content:
          "One camera, multiple athletes: side-by-side rep counts, form scores and coach insights for group training.",
      },
      { property: "og:title", content: "School Mode — MOTIONMATE" },
      {
        property: "og:description",
        content: "Group training on a single camera with per-athlete insights.",
      },
    ],
  }),
  component: School,
});

function School() {
  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">School Mode</h1>
          <p className="mt-2 text-muted-foreground">
            One camera, four lanes — Class 9B · Squat circuit
          </p>
        </div>
        <Link
          to="/train/$exercise"
          params={{ exercise: "squat" }}
          className="flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Open camera
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Athletes in frame" value={4} sub="Multi-pose tracking" />
        <Stat label="Class average" value={82} sub="Form score" />
        <Stat label="Needs attention" value={1} sub="Dev S. — knee tracking" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SCHOOL_LANES.map((l) => (
          <div key={l.name} className="panel p-5">
            <div className="mb-3 flex h-28 items-center justify-center rounded-md border border-border bg-secondary/50 text-xs text-muted-foreground">
              Lane preview
            </div>
            <p className="font-display font-bold">{l.name}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">{l.reps} reps</span>
              <span className="stat-num text-xl">{l.score}</span>
            </div>
            <p
              className={`mt-2 text-sm ${
                l.score < 75 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.status}
            </p>
          </div>
        ))}
      </div>

      <div className="panel mt-4 p-6">
        <h2 className="font-display text-lg font-bold">Coach insights</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Dev S. shows knee valgus below 110° — regress to box squats.</li>
          <li>• Meera I. is 15° short of depth target across the last 8 reps.</li>
          <li>• Class cadence is 0.4s faster than target — cue a 3-second descent.</li>
        </ul>
      </div>
    </Shell>
  );
}
