type Fig = { knee: number; torso: number; elbow: number };

function StickFigure({
  pose,
  color,
  ghost,
}: {
  pose: Fig;
  color: string;
  ghost?: boolean;
}) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const kneeFlex = 180 - pose.knee;
  const ankle = { x: 100, y: 190 };
  const shin = 46;
  const thigh = 46;
  const knee = {
    x: ankle.x + Math.sin(rad(kneeFlex * 0.45)) * shin,
    y: ankle.y - Math.cos(rad(kneeFlex * 0.45)) * shin,
  };
  const hip = {
    x: knee.x - Math.sin(rad(kneeFlex * 0.55)) * thigh,
    y: knee.y - Math.cos(rad(kneeFlex * 0.55)) * thigh,
  };
  const torsoLen = 52;
  const shoulder = {
    x: hip.x + Math.sin(rad(pose.torso)) * torsoLen,
    y: hip.y - Math.cos(rad(pose.torso)) * torsoLen,
  };
  const elbowFlex = 180 - pose.elbow;
  const elbow = {
    x: shoulder.x + Math.sin(rad(40)) * 26,
    y: shoulder.y + Math.cos(rad(40)) * 26,
  };
  const wrist = {
    x: elbow.x + Math.sin(rad(40 + elbowFlex * 0.6)) * 24,
    y: elbow.y + Math.cos(rad(40 + elbowFlex * 0.6)) * 8,
  };
  const head = {
    x: shoulder.x + Math.sin(rad(pose.torso)) * 16,
    y: shoulder.y - Math.cos(rad(pose.torso)) * 16,
  };

  const line = (a: { x: number; y: number }, b: { x: number; y: number }, k: string) => (
    <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
  );

  return (
    <g
      stroke={color}
      strokeWidth={ghost ? 3 : 5}
      strokeLinecap="round"
      strokeDasharray={ghost ? "6 6" : undefined}
      fill="none"
      opacity={ghost ? 0.65 : 1}
    >
      {line(ankle, knee, "a")}
      {line(knee, hip, "b")}
      {line(hip, shoulder, "c")}
      {line(shoulder, elbow, "d")}
      {line(elbow, wrist, "e")}
      <circle cx={head.x} cy={head.y - 6} r={11} />
    </g>
  );
}

export function ShowMeHow({
  yourPose,
  targetPose,
  correction,
}: {
  yourPose: Fig;
  targetPose: Fig;
  correction: string;
}) {
  return (
    <div className="panel p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold">Show Me How</h2>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Correction overlay
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Panel title="Your Movement">
          <StickFigure pose={yourPose} color="var(--color-primary)" />
        </Panel>
        <Panel title="Target Movement">
          <StickFigure pose={targetPose} color="var(--color-ink)" />
        </Panel>
        <Panel title="Overlay">
          <StickFigure pose={targetPose} color="var(--color-ink)" ghost />
          <StickFigure pose={yourPose} color="var(--color-primary)" />
        </Panel>
      </div>

      <p className="mt-4 rounded-md border border-border bg-secondary/60 p-3 text-sm">
        <span className="font-semibold">Fix: </span>
        {correction}
      </p>
      <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-5 bg-primary" /> Your movement
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-5 bg-ink" /> Target movement
        </span>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <svg viewBox="0 0 200 220" className="mt-1 h-48 w-full">
        {children}
      </svg>
    </div>
  );
}
