export type LM = { x: number; y: number; z: number; visibility?: number };

// MediaPipe Pose landmark indices
export const P = {
  nose: 0,
  lShoulder: 11,
  rShoulder: 12,
  lElbow: 13,
  rElbow: 14,
  lWrist: 15,
  rWrist: 16,
  lHip: 23,
  rHip: 24,
  lKnee: 25,
  rKnee: 26,
  lAnkle: 27,
  rAnkle: 28,
};

export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

export function angle(a: LM, b: LM, c: LM): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const mag = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
  if (mag === 0) return 180;
  return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
}

/** Angle of segment a->b from vertical, in degrees (0 = perfectly upright). */
export function tiltFromVertical(a: LM, b: LM): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}

export function mid(a: LM, b: LM): LM {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

export type ExerciseId =
  | "squat"
  | "pushup"
  | "curl"
  | "press"
  | "deadlift"
  | "lunge"
  | "plank";

export type Exercise = {
  id: ExerciseId;
  name: string;
  focus: string;
  cue: string;
  isHold?: boolean;
  /** primary joint angle tracked for reps */
  primary: (lm: LM[]) => number;
  /** angle below which the rep is "down" */
  downAt: number;
  /** angle above which the rep is "up" */
  upAt: number;
  targetDepth: number;
};

const kneeAngle = (lm: LM[]) =>
  (angle(lm[P.lHip], lm[P.lKnee], lm[P.lAnkle]) +
    angle(lm[P.rHip], lm[P.rKnee], lm[P.rAnkle])) /
  2;
const elbowAngle = (lm: LM[]) =>
  (angle(lm[P.lShoulder], lm[P.lElbow], lm[P.lWrist]) +
    angle(lm[P.rShoulder], lm[P.rElbow], lm[P.rWrist])) /
  2;
const hipAngle = (lm: LM[]) =>
  (angle(lm[P.lShoulder], lm[P.lHip], lm[P.lKnee]) +
    angle(lm[P.rShoulder], lm[P.rHip], lm[P.rKnee])) /
  2;

export const EXERCISES: Exercise[] = [
  {
    id: "squat",
    name: "Squat",
    focus: "Quads · Glutes",
    cue: "Chest up, knees tracking over toes.",
    primary: kneeAngle,
    downAt: 100,
    upAt: 160,
    targetDepth: 90,
  },
  {
    id: "pushup",
    name: "Push-up",
    focus: "Chest · Triceps",
    cue: "Body in one line, elbows at 45°.",
    primary: elbowAngle,
    downAt: 95,
    upAt: 155,
    targetDepth: 85,
  },
  {
    id: "curl",
    name: "Bicep Curl",
    focus: "Biceps",
    cue: "Elbows pinned to your ribs.",
    primary: elbowAngle,
    downAt: 55,
    upAt: 150,
    targetDepth: 45,
  },
  {
    id: "press",
    name: "Overhead Press",
    focus: "Shoulders",
    cue: "Ribs down, press straight overhead.",
    primary: elbowAngle,
    downAt: 95,
    upAt: 160,
    targetDepth: 90,
  },
  {
    id: "deadlift",
    name: "Deadlift",
    focus: "Posterior chain",
    cue: "Hinge at the hips, spine neutral.",
    primary: hipAngle,
    downAt: 110,
    upAt: 165,
    targetDepth: 95,
  },
  {
    id: "lunge",
    name: "Lunge",
    focus: "Legs · Balance",
    cue: "Front knee at 90°, torso tall.",
    primary: kneeAngle,
    downAt: 105,
    upAt: 160,
    targetDepth: 95,
  },
  {
    id: "plank",
    name: "Plank",
    focus: "Core · Stability",
    cue: "Hold a straight line, hips level.",
    isHold: true,
    primary: hipAngle,
    downAt: 0,
    upAt: 400,
    targetDepth: 170,
  },
];

export const getExercise = (id: string) =>
  EXERCISES.find((e) => e.id === id) ?? EXERCISES[0];

export type Metrics = {
  angle: number;
  posture: number;
  balance: number;
  alignment: number;
  depth: number;
  cadence: number;
  score: number;
};

/** Biomechanical scoring from a single frame + rep history. */
export function analyzeFrame(
  ex: Exercise,
  lm: LM[],
  lastRepDepth: number,
  cadenceSec: number,
): Metrics {
  const a = ex.primary(lm);
  const shoulders = mid(lm[P.lShoulder], lm[P.rShoulder]);
  const hips = mid(lm[P.lHip], lm[P.rHip]);

  const torsoTilt = tiltFromVertical(shoulders, hips);
  const posture = ex.isHold || ex.id === "pushup"
    ? clamp(100 - Math.abs(180 - hipAngle(lm)) * 2.2)
    : clamp(100 - Math.max(0, torsoTilt - 12) * 2.4);

  const shoulderLevel = Math.abs(lm[P.lShoulder].y - lm[P.rShoulder].y);
  const hipLevel = Math.abs(lm[P.lHip].y - lm[P.rHip].y);
  const balance = clamp(100 - (shoulderLevel + hipLevel) * 420);

  const leftPrim = ex.id === "squat" || ex.id === "lunge" || ex.id === "deadlift"
    ? angle(lm[P.lHip], lm[P.lKnee], lm[P.lAnkle])
    : angle(lm[P.lShoulder], lm[P.lElbow], lm[P.lWrist]);
  const rightPrim = ex.id === "squat" || ex.id === "lunge" || ex.id === "deadlift"
    ? angle(lm[P.rHip], lm[P.rKnee], lm[P.rAnkle])
    : angle(lm[P.rShoulder], lm[P.rElbow], lm[P.rWrist]);
  const alignment = clamp(100 - Math.abs(leftPrim - rightPrim) * 1.8);

  const depth = ex.isHold
    ? clamp(100 - Math.abs(ex.targetDepth - a) * 2)
    : clamp(100 - Math.max(0, lastRepDepth - ex.targetDepth) * 1.6);

  const idealCadence = 2.6;
  const cadence = cadenceSec
    ? clamp(100 - Math.abs(cadenceSec - idealCadence) * 22)
    : 0;

  const parts = [posture, balance, alignment, depth];
  const score = Math.round(parts.reduce((s, v) => s + v, 0) / parts.length);

  return { angle: a, posture, balance, alignment, depth, cadence, score };
}

export function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function feedbackFor(ex: Exercise, m: Metrics): string {
  if (m.posture < 70)
    return ex.isHold || ex.id === "pushup"
      ? "Hips level — hold one straight line."
      : "Keep your back straight, chest tall.";
  if (m.alignment < 70) return "Even it out — both sides working equally.";
  if (m.balance < 70) return "Steady your base, weight centered.";
  if (m.depth < 70) return "Go a little deeper on the next rep.";
  if (m.score >= 88) return "Good form! Keep that rhythm.";
  return "Controlled tempo — you're on track.";
}

/** Fatigue = decline in per-rep scores across the session. */
export function fatigueIndex(repScores: number[]): number {
  if (repScores.length < 4) return 0;
  const half = Math.floor(repScores.length / 2);
  const first = avg(repScores.slice(0, half));
  const last = avg(repScores.slice(half));
  return Math.max(0, Math.round(first - last));
}

export const avg = (a: number[]) =>
  a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
