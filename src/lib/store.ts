export type SavedSession = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  reps: number;
  holdSeconds: number;
  score: number;
  posture: number;
  balance: number;
  alignment: number;
  depth: number;
  cadence: number;
  fatigue: number;
  repScores: number[];
  mode: "live" | "offline";
  date: string;
};

const KEY = "motionmate.sessions";

export function loadSessions(): SavedSession[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveSession(s: SavedSession) {
  if (typeof window === "undefined") return;
  const all = [s, ...loadSessions()].slice(0, 40);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export const ATHLETE = {
  name: "Rahul",
  fullName: "Rahul Menon",
  score: 86,
  weeklyImprovement: 6.4,
  sessions: 18,
  streak: 5,
};

export const FINGERPRINT = [
  { label: "Balance", value: 82 },
  { label: "Stability", value: 88 },
  { label: "Flexibility", value: 71 },
  { label: "Coordination", value: 79 },
  { label: "Control", value: 91 },
];

export const WEEKLY = [
  { day: "Mon", score: 78 },
  { day: "Tue", score: 81 },
  { day: "Wed", score: 80 },
  { day: "Thu", score: 84 },
  { day: "Fri", score: 83 },
  { day: "Sat", score: 88 },
  { day: "Sun", score: 86 },
];

export const RECENT = [
  { exercise: "Squat", reps: 24, score: 88, when: "Yesterday · 18:20" },
  { exercise: "Push-up", reps: 32, score: 81, when: "Tue · 07:05" },
  { exercise: "Deadlift", reps: 18, score: 84, when: "Mon · 19:40" },
];

export type CoachAthlete = {
  id: string;
  name: string;
  group: string;
  score: number;
  improvement: number;
  sessions: number;
  alert?: string;
  strengths: string[];
  weaknesses: string[];
  insight: string;
  trend: number[];
};

export const ATHLETES: CoachAthlete[] = [
  {
    id: "rahul",
    name: "Rahul Menon",
    group: "Senior · Strength",
    score: 86,
    improvement: 6.4,
    sessions: 18,
    strengths: ["Control", "Squat depth"],
    weaknesses: ["Hip flexibility", "Late-set posture"],
    insight:
      "Form holds to rep 9, then torso angle drifts 8°. Cap working sets at 8 reps for two weeks.",
    trend: [74, 77, 79, 81, 83, 86],
  },
  {
    id: "aisha",
    name: "Aisha Khan",
    group: "Senior · Strength",
    score: 91,
    improvement: 3.1,
    sessions: 22,
    strengths: ["Stability", "Cadence consistency"],
    weaknesses: ["Left-right symmetry (4°)"],
    insight: "Very consistent tempo. Add unilateral work to close the 4° asymmetry.",
    trend: [84, 86, 87, 88, 90, 91],
  },
  {
    id: "dev",
    name: "Dev Sharma",
    group: "Junior · Conditioning",
    score: 68,
    improvement: -2.2,
    sessions: 9,
    alert: "Form score dropped 2.2% — knee valgus flagged in 3 sessions",
    strengths: ["Coordination"],
    weaknesses: ["Knee tracking", "Core bracing"],
    insight: "Knees collapse inward below 110°. Regress to box squats this week.",
    trend: [72, 71, 70, 69, 70, 68],
  },
  {
    id: "meera",
    name: "Meera Iyer",
    group: "Junior · Conditioning",
    score: 79,
    improvement: 5.0,
    sessions: 14,
    strengths: ["Flexibility", "Plank hold"],
    weaknesses: ["Press lockout"],
    insight: "Overhead range improving fast. Progress load by 5%.",
    trend: [70, 72, 74, 76, 78, 79],
  },
];

export const SCHOOL_LANES = [
  { name: "Rahul M.", reps: 12, score: 88, status: "Good form" },
  { name: "Aisha K.", reps: 11, score: 92, status: "Good form" },
  { name: "Dev S.", reps: 9, score: 66, status: "Knees caving" },
  { name: "Meera I.", reps: 12, score: 80, status: "Shallow depth" },
];
