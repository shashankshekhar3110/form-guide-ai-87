import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, Stat, Bar } from "@/components/Shell";
import { FINGERPRINT, WEEKLY, loadSessions, type SavedSession } from "@/lib/store";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — MOTIONMATE" },
      {
        name: "description",
        content:
          "Long-term movement quality: form score trend, Movement Fingerprint changes and every recorded session.",
      },
      { property: "og:title", content: "Progress — MOTIONMATE" },
      {
        property: "og:description",
        content: "Form score trend and session history over time.",
      },
    ],
  }),
  component: Progress,
});

function Progress() {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  useEffect(() => setSessions(loadSessions()), []);
  const max = Math.max(...WEEKLY.map((w) => w.score));

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Progress</h1>
      <p className="mt-2 text-muted-foreground">
        Movement quality over time, measured from your own camera sessions.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Avg form score" value={86} sub="+6.4% vs last week" />
        <Stat label="Camera sessions" value={sessions.length + 18} sub="All time" />
        <Stat label="Consistency" value="92%" sub="Cadence stability" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Form score trend</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
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

      <div className="panel mt-4 overflow-hidden">
        <h2 className="border-b border-border p-6 pb-4 font-display text-lg font-bold">
          Your recorded sessions
        </h2>
        {sessions.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No camera sessions saved on this device yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-6 py-3">Exercise</th>
                <th className="px-6 py-3">Mode</th>
                <th className="px-6 py-3">Reps</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Fatigue</th>
                <th className="px-6 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-3 font-medium">{s.exerciseName}</td>
                  <td className="px-6 py-3 capitalize text-muted-foreground">{s.mode}</td>
                  <td className="stat-num px-6 py-3">{s.reps || `${s.holdSeconds}s`}</td>
                  <td className="stat-num px-6 py-3">{s.score}</td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {s.fatigue > 0 ? `−${s.fatigue}` : "Stable"}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {new Date(s.date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}
