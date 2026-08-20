import { createFileRoute, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MOTIONMATE — AI Movement Coach" },
      {
        name: "description",
        content:
          "MOTIONMATE analyses your form in real time with on-device pose tracking: rep counting, joint angles, form scoring and voice coaching.",
      },
      { property: "og:title", content: "MOTIONMATE — AI Movement Coach" },
      {
        property: "og:description",
        content: "Move better. Train smarter. Real-time on-device form analysis.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between border-r border-border bg-card px-8 py-10 lg:px-14">
        <Wordmark />
        <div className="max-w-md py-16">
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            Move better.
            <br />
            Train smarter.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            MOTIONMATE watches your reps through your own camera, measures joint
            angles frame by frame and coaches you out loud — all processed on your
            device.
          </p>

          <div className="mt-8 space-y-3">
            <label className="block text-sm font-medium">Email</label>
            <input
              defaultValue="rahul.menon@motionmate.app"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <label className="block pt-1 text-sm font-medium">Password</label>
            <input
              type="password"
              defaultValue="password"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Link
              to="/dashboard"
              className="mt-3 flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign in as athlete
            </Link>
            <Link
              to="/coach"
              className="flex h-11 w-full items-center justify-center rounded-md border border-input text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Sign in as coach
            </Link>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Video never leaves your device — pose processing runs locally.
        </p>
      </div>

      <div className="hidden flex-col justify-center gap-4 bg-secondary/60 px-14 lg:flex">
        {[
          ["Real-time pose tracking", "33 body landmarks at camera framerate."],
          ["Biomechanical scoring", "Posture, balance, alignment, depth, cadence."],
          ["Voice coach", "Live cues the moment your form slips."],
          ["Offline mode", "Record now, analyse locally, review later."],
        ].map(([t, d]) => (
          <div key={t} className="panel p-5">
            <p className="font-display font-bold">{t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
