import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Shell, Bar } from "@/components/Shell";
import { ShowMeHow } from "@/components/ShowMeHow";
import { getExercise } from "@/lib/pose/analysis";
import { usePoseCoach } from "@/lib/pose/usePoseCoach";
import { saveSession } from "@/lib/store";

export const Route = createFileRoute("/train/$exercise")({
  head: () => ({
    meta: [
      { title: "Live Camera Coaching — MOTIONMATE" },
      {
        name: "description",
        content:
          "Live camera pose tracking with skeleton overlay, rep counting, form score and voice coaching — processed on your device.",
      },
      { property: "og:title", content: "Live Camera Coaching — MOTIONMATE" },
      {
        property: "og:description",
        content: "Real-time reps, joint angles and form feedback from your own camera.",
      },
    ],
  }),
  component: TrainScreen,
});

function TrainScreen() {
  const { exercise } = Route.useParams();
  const ex = useMemo(() => getExercise(exercise), [exercise]);
  const navigate = useNavigate();
  const [mode, setMode] = useState<"live" | "offline">("live");
  const [voice, setVoice] = useState(true);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const coach = usePoseCoach(ex.id, voice);
  const m = coach.state.metrics;

  const endSession = () => {
    saveSession({
      id: String(Date.now()),
      exerciseId: ex.id,
      exerciseName: ex.name,
      reps: coach.state.reps,
      holdSeconds: Math.round(coach.state.holdSeconds),
      score: m?.score ?? 0,
      posture: m?.posture ?? 0,
      balance: m?.balance ?? 0,
      alignment: m?.alignment ?? 0,
      depth: m?.depth ?? 0,
      cadence: m?.cadence ?? 0,
      fatigue: coach.state.fatigue,
      repScores: coach.state.repScores,
      mode,
      date: new Date().toISOString(),
    });
    coach.stop();
    navigate({ to: "/summary" });
  };

  const denied = coach.state.status === "denied" || coach.state.status === "error";

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/exercises" className="text-sm text-muted-foreground hover:underline">
            ← Exercises
          </Link>
          <h1 className="text-3xl font-extrabold">{ex.name}</h1>
          <p className="text-sm text-muted-foreground">{ex.cue}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border p-1">
            {(["live", "offline"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setMode(v)}
                className={`rounded px-3 py-1.5 text-sm font-medium capitalize ${
                  mode === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {v} mode
              </button>
            ))}
          </div>
          <button
            onClick={() => setVoice((v) => !v)}
            className={`h-10 rounded-md border px-4 text-sm font-medium ${
              voice ? "border-primary text-primary" : "border-border text-muted-foreground"
            }`}
          >
            Voice Coach {voice ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs">
            <span className="flex items-center gap-2 font-semibold uppercase tracking-wider">
              <span
                className={`h-2 w-2 rounded-full ${
                  mode === "live" ? "bg-destructive" : "bg-warning"
                } ${coach.state.status === "ready" ? "animate-pulse" : ""}`}
              />
              {mode === "live" ? "Live" : "Offline Mode"}
              {coach.recording ? " · Recording" : ""}
              {coach.replaying ? " · Analysing clip" : ""}
            </span>
            <span className="text-muted-foreground">
              On-device processing · no video uploaded
            </span>
          </div>

          <div className="relative aspect-video w-full bg-ink">
            <video
              ref={coach.videoRef}
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />
            <canvas
              ref={coach.canvasRef}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {coach.state.status !== "ready" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/85 px-6 text-center text-background">
                <p className="font-display text-lg font-bold">
                  {coach.state.status === "loading"
                    ? "Loading on-device model…"
                    : denied
                      ? "Camera unavailable"
                      : "Camera not started"}
                </p>
                <p className="max-w-sm text-sm opacity-80">
                  {coach.state.message ||
                    "MOTIONMATE needs your camera to measure joint angles. Nothing is uploaded."}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={coach.start}
                    className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
                  >
                    {denied ? "Try camera again" : "Enable camera"}
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="h-10 rounded-md border border-background/40 px-5 text-sm font-semibold"
                  >
                    Upload a video instead
                  </button>
                </div>
              </div>
            )}

            {coach.state.status === "ready" && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div className="rounded-md bg-ink/75 px-4 py-2 text-background">
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Reps</p>
                  <p className="stat-num text-3xl">
                    {ex.isHold
                      ? `${Math.round(coach.state.holdSeconds)}s`
                      : coach.state.reps}
                  </p>
                </div>
                <p className="max-w-xs rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                  {coach.state.feedback}
                </p>
                <div className="rounded-md bg-ink/75 px-4 py-2 text-background">
                  <p className="text-[10px] uppercase tracking-wider opacity-70">Form</p>
                  <p className="stat-num text-3xl">{m?.score ?? "—"}</p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) coach.analyzeClip(URL.createObjectURL(f));
            }}
          />

          <div className="flex flex-wrap items-center gap-2 border-t border-border p-3">
            <button
              onClick={coach.reset}
              className="h-9 rounded-md border border-border px-4 text-sm font-medium hover:bg-secondary"
            >
              Reset counter
            </button>
            {mode === "offline" && (
              <>
                {!coach.recording ? (
                  <button
                    onClick={coach.startRecording}
                    disabled={coach.state.status !== "ready"}
                    className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    Record clip
                  </button>
                ) : (
                  <button
                    onClick={coach.stopRecording}
                    className="h-9 rounded-md bg-destructive px-4 text-sm font-semibold text-destructive-foreground"
                  >
                    Stop recording
                  </button>
                )}
                {coach.clipUrl && (
                  <>
                    <button
                      onClick={() => coach.analyzeClip(coach.clipUrl!)}
                      className="h-9 rounded-md border border-primary px-4 text-sm font-semibold text-primary"
                    >
                      Analyse saved clip
                    </button>
                    <a
                      href={coach.clipUrl}
                      download={`${ex.id}-clip.webm`}
                      className="h-9 rounded-md border border-border px-4 text-sm font-medium leading-9 hover:bg-secondary"
                    >
                      Save to device
                    </a>
                  </>
                )}
              </>
            )}
            <button
              onClick={endSession}
              className="ml-auto h-9 rounded-md bg-ink px-4 text-sm font-semibold text-background"
            >
              End session
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold">Biomechanics</h2>
              <span className="stat-num text-sm text-muted-foreground">
                {m ? `${Math.round(m.angle)}° joint` : "—"}
              </span>
            </div>
            <div className="mt-4 space-y-3.5">
              <Bar label="Posture" value={m?.posture ?? 0} />
              <Bar label="Balance" value={m?.balance ?? 0} />
              <Bar label="Alignment" value={m?.alignment ?? 0} />
              <Bar label="Depth" value={m?.depth ?? 0} />
              <Bar label="Cadence" value={m?.cadence ?? 0} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {coach.state.tracking
                ? "Athlete detected · 33 landmarks tracking"
                : "Waiting for a full-body view"}
            </p>
          </div>

          <div className="panel p-5">
            <h2 className="font-display text-lg font-bold">Fatigue Insight</h2>
            {coach.state.repScores.length < 4 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Collecting reps — needs 4+ reps to detect consistency drift.
              </p>
            ) : (
              <>
                <p className="stat-num mt-2 text-3xl">
                  {coach.state.fatigue > 0 ? `−${coach.state.fatigue}` : "Stable"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {coach.state.fatigue > 6
                    ? "Form is degrading across reps — consider ending the set."
                    : "Movement consistency is holding across reps."}
                </p>
              </>
            )}
            <div className="mt-4 flex h-16 items-end gap-1">
              {coach.state.repScores.slice(-16).map((s, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/80"
                  style={{ height: `${Math.max(6, s)}%` }}
                  title={`Rep ${i + 1}: ${s}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ShowMeHow
          yourPose={{
            knee: m ? Math.max(70, Math.min(175, m.angle)) : 130,
            torso: m ? Math.round((100 - m.posture) * 0.4) : 22,
            elbow: 150,
          }}
          targetPose={{ knee: ex.targetDepth, torso: 8, elbow: 160 }}
          correction={
            m && m.posture < 75
              ? "Your torso leans ~15° further forward than target. Brace your core and lift the chest."
              : m && m.depth < 75
                ? `Stop short of target depth — aim for ${ex.targetDepth}° at the bottom.`
                : "Close match to target. Keep tempo controlled through the bottom position."
          }
        />
      </div>
    </Shell>
  );
}
