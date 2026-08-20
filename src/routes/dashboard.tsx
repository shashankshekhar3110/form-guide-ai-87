import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Stat, Bar } from "@/components/Shell";
import { ATHLETE, FINGERPRINT, RECENT, WEEKLY } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Athlete Dashboard — MOTIONMATE" },
      {
        name: "description",
        content:
          "Your movement score, weekly improvement, sessions and Movement Fingerprint across balance, stability, flexibility, coordination and control.",
      },
      { property: "og:title", content: "Athlete Dashboard — MOTIONMATE" },
      {
        property: "og:description",
        content: "Track your movement score and Movement Fingerprint.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const max = Math.max(...WEEKLY.map((w) => w.score));
  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Good afternoon,</p>
          <h1 className="text-3xl font-extrabold">{ATHLETE.name}</h1>
        </div>
        <Link
          to="/exercises"
          className="flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Start a session
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Movement score" value={ATHLETE.score} sub="Last 7 days" />
        <Stat
          label="Weekly improvement"
          value={`+${ATHLETE.weeklyImprovement}%`}
          sub="vs previous week"
        />
        <Stat label="Sessions" value={ATHLETE.sessions} sub="This month" />
        <Stat label="Streak" value={`${ATHLETE.streak} days`} sub="Keep it going" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Form score this week</h2>
          <div className="mt-6 flex h-44 items-end gap-3">
            {WEEKLY.map((w) => (
              <div key={w.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="stat-num text-xs text-muted-foreground">{w.score}</span>
                <div
                  className="w-full rounded-t-md bg-primary/85"
                  style={{ height: `${(w.score / max) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground">{w.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="font-display text-lg font-bold">Movement Fingerprint</h2>
          <div className="mt-5 space-y-4">
            {FINGERPRINT.map((f) => (
              <Bar key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </div>
      </div>

      <div className="panel mt-4 p-6">
        <h2 className="font-display text-lg font-bold">Recent sessions</h2>
        <div className="mt-4 divide-y divide-border">
          {RECENT.map((r) => (
            <div key={r.exercise} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{r.exercise}</p>
                <p className="text-sm text-muted-foreground">
                  {r.reps} reps · {r.when}
                </p>
              </div>
              <span className="stat-num text-lg">{r.score}</span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
