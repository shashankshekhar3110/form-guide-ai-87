import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { ATHLETES } from "@/lib/store";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Coach Dashboard — MOTIONMATE" },
      {
        name: "description",
        content:
          "Coach view: athlete form scores, improvement, alerts and per-athlete strengths, weaknesses and training insights.",
      },
      { property: "og:title", content: "Coach Dashboard — MOTIONMATE" },
      {
        property: "og:description",
        content: "Squad-wide form scores, alerts and athlete profiles.",
      },
    ],
  }),
  component: CoachDashboard,
});

function CoachDashboard() {
  const [selected, setSelected] = useState(ATHLETES[0]!.id);
  const athlete = ATHLETES.find((a) => a.id === selected)!;
  const alerts = ATHLETES.filter((a) => a.alert);

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">Coach dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        14 athletes · 6 sessions today · 1 alert needing review
      </p>

      {alerts.map((a) => (
        <div
          key={a.id}
          className="mt-5 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm"
        >
          <span className="font-semibold">{a.name}: </span>
          {a.alert}
        </div>
      ))}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="panel overflow-hidden">
          <h2 className="border-b border-border p-5 font-display text-lg font-bold">
            Athletes
          </h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-3">Athlete</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Change</th>
                <th className="px-5 py-3">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {ATHLETES.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                  className={`cursor-pointer border-b border-border last:border-0 hover:bg-secondary/60 ${
                    a.id === selected ? "bg-secondary" : ""
                  }`}
                >
                  <td className="px-5 py-3">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.group}</p>
                  </td>
                  <td className="stat-num px-5 py-3">{a.score}</td>
                  <td
                    className={`stat-num px-5 py-3 ${
                      a.improvement < 0 ? "text-destructive" : "text-success"
                    }`}
                  >
                    {a.improvement > 0 ? "+" : ""}
                    {a.improvement}%
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{a.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Athlete profile
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold">{athlete.name}</h2>
          <p className="text-sm text-muted-foreground">{athlete.group}</p>

          <div className="mt-5 flex h-24 items-end gap-2">
            {athlete.trend.map((t, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/80"
                style={{ height: `${t}%` }}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Last 6 sessions</p>

          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="font-semibold">Strengths</p>
              <p className="text-muted-foreground">{athlete.strengths.join(" · ")}</p>
            </div>
            <div>
              <p className="font-semibold">Weaknesses</p>
              <p className="text-muted-foreground">{athlete.weaknesses.join(" · ")}</p>
            </div>
            <div className="rounded-md border border-border bg-secondary/50 p-3">
              <p className="font-semibold">Training insight</p>
              <p className="mt-1 text-muted-foreground">{athlete.insight}</p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
