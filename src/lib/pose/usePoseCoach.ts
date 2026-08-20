import { useCallback, useEffect, useRef, useState } from "react";
import {
  analyzeFrame,
  avg,
  fatigueIndex,
  feedbackFor,
  getExercise,
  POSE_CONNECTIONS,
  type LM,
  type Metrics,
} from "./analysis";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL = "/models/pose_landmarker_lite.task";

export type CoachState = {
  status: "idle" | "loading" | "ready" | "denied" | "error";
  message: string;
  reps: number;
  holdSeconds: number;
  metrics: Metrics | null;
  feedback: string;
  repScores: number[];
  fatigue: number;
  tracking: boolean;
  lastRepAngle: number;
};

const EMPTY: CoachState = {
  status: "idle",
  message: "",
  reps: 0,
  holdSeconds: 0,
  metrics: null,
  feedback: "Get in frame — full body visible.",
  repScores: [],
  fatigue: 0,
  tracking: false,
  lastRepAngle: 180,
};

export function usePoseCoach(exerciseId: string, voiceOn: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const voiceRef = useRef(voiceOn);
  const lastSpokenRef = useRef({ text: "", at: 0 });

  const phaseRef = useRef<"up" | "down">("up");
  const minAngleRef = useRef(180);
  const repStartRef = useRef(0);
  const frameScoresRef = useRef<number[]>([]);
  const holdRef = useRef(0);
  const lastTsRef = useRef(0);

  const [state, setState] = useState<CoachState>(EMPTY);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [clipBlob, setClipBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [replaying, setReplaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    voiceRef.current = voiceOn;
    if (!voiceOn && typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, [voiceOn]);

  const speak = useCallback((text: string) => {
    if (!voiceRef.current || typeof window === "undefined") return;
    const now = performance.now();
    if (
      lastSpokenRef.current.text === text &&
      now - lastSpokenRef.current.at < 9000
    )
      return;
    if (now - lastSpokenRef.current.at < 3500) return;
    lastSpokenRef.current = { text, at: now };
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.pitch = 1;
    window.speechSynthesis?.speak(u);
  }, []);

  const draw = useCallback((lms: LM[] | null, ok: boolean) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    if (!lms) return;
    const good = ok;
    ctx.lineWidth = Math.max(3, w / 220);
    ctx.strokeStyle = good ? "rgba(255,255,255,0.92)" : "rgba(232,85,43,0.95)";
    for (const [a, b] of POSE_CONNECTIONS) {
      const pa = lms[a];
      const pb = lms[b];
      if (!pa || !pb) continue;
      ctx.beginPath();
      ctx.moveTo(pa.x * w, pa.y * h);
      ctx.lineTo(pb.x * w, pb.y * h);
      ctx.stroke();
    }
    ctx.fillStyle = good ? "rgba(232,85,43,0.95)" : "rgba(255,255,255,0.95)";
    const keys = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    for (const i of keys) {
      const p = lms[i];
      if (!p) continue;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, Math.max(4, w / 160), 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const lm = landmarkerRef.current;
    if (!video || !lm) return;
    const ex = getExercise(exerciseId);

    if (video.readyState >= 2) {
      let result: any = null;
      try {
        result = lm.detectForVideo(video, performance.now());
      } catch {
        /* frame skipped */
      }
      const lms: LM[] | undefined = result?.landmarks?.[0];
      if (lms && lms.length > 24) {
        const m = analyzeFrame(ex, lms, minAngleRef.current, 0);
        draw(lms, m.score >= 75);
        frameScoresRef.current.push(m.score);
        if (frameScoresRef.current.length > 240) frameScoresRef.current.shift();

        const now = performance.now();
        const dt = lastTsRef.current ? (now - lastTsRef.current) / 1000 : 0;
        lastTsRef.current = now;

        if (ex.isHold) {
          if (m.score >= 65) holdRef.current += dt;
          setState((s) => ({
            ...s,
            tracking: true,
            metrics: m,
            holdSeconds: holdRef.current,
            feedback: feedbackFor(ex, m),
          }));
          if (holdRef.current > 3) speak(feedbackFor(ex, m));
        } else {
          const a = m.angle;
          if (phaseRef.current === "up" && a < ex.downAt) {
            phaseRef.current = "down";
            minAngleRef.current = a;
            repStartRef.current = now;
          } else if (phaseRef.current === "down") {
            minAngleRef.current = Math.min(minAngleRef.current, a);
            if (a > ex.upAt) {
              phaseRef.current = "up";
              const cadence = (now - repStartRef.current) / 1000;
              const repM = analyzeFrame(ex, lms, minAngleRef.current, cadence);
              const repScore = Math.round(
                (repM.score + avg(frameScoresRef.current.slice(-60))) / 2,
              );
              frameScoresRef.current = [];
              setState((s) => {
                const repScores = [...s.repScores, repScore];
                return {
                  ...s,
                  reps: s.reps + 1,
                  repScores,
                  fatigue: fatigueIndex(repScores),
                  lastRepAngle: Math.round(minAngleRef.current),
                  metrics: repM,
                  feedback: feedbackFor(ex, repM),
                };
              });
              speak(feedbackFor(ex, repM));
            }
          }
          setState((s) => ({
            ...s,
            tracking: true,
            metrics: s.metrics ? { ...m, cadence: s.metrics.cadence } : m,
          }));
        }
      } else {
        draw(null, false);
        setState((s) => ({
          ...s,
          tracking: false,
          feedback: "No athlete detected — step back so your full body is in frame.",
        }));
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, exerciseId, speak]);

  const ensureLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(WASM_BASE);
    landmarkerRef.current = await vision.PoseLandmarker.createFromOptions(
      fileset,
      {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
      },
    );
    return landmarkerRef.current;
  }, []);

  const start = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", message: "Loading on-device model…" }));
    try {
      await ensureLandmarker();
    } catch {
      setState((s) => ({
        ...s,
        status: "error",
        message: "Pose model could not load on this device.",
      }));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        await video.play().catch(() => {});
      }
      setState((s) => ({ ...s, status: "ready", message: "" }));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    } catch (e: any) {
      setState((s) => ({
        ...s,
        status: e?.name === "NotAllowedError" ? "denied" : "error",
        message:
          e?.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access, or upload a video instead."
            : "No camera available. Upload a recorded video instead.",
      }));
    }
  }, [ensureLandmarker, loop]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  const reset = useCallback(() => {
    phaseRef.current = "up";
    minAngleRef.current = 180;
    holdRef.current = 0;
    frameScoresRef.current = [];
    setState((s) => ({
      ...EMPTY,
      status: s.status,
      message: s.message,
    }));
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setClipBlob(blob);
      setClipUrl(URL.createObjectURL(blob));
    };
    recorderRef.current = rec;
    rec.start();
    setRecording(true);
    setRecordSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setRecordSeconds((v) => v + 1), 1000);
  }, []);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  /** Run the same on-device pipeline over a saved / uploaded clip. */
  const analyzeClip = useCallback(
    async (url: string) => {
      await ensureLandmarker();
      const video = videoRef.current;
      if (!video) return;
      stop();
      reset();
      setReplaying(true);
      video.srcObject = null;
      video.src = url;
      video.loop = false;
      video.muted = true;
      await video.play().catch(() => {});
      setState((s) => ({ ...s, status: "ready", message: "" }));
      rafRef.current = requestAnimationFrame(loop);
      video.onended = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setReplaying(false);
      };
    },
    [ensureLandmarker, loop, reset, stop],
  );

  useEffect(
    () => () => {
      stop();
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [stop],
  );

  return {
    videoRef,
    canvasRef,
    state,
    start,
    stop,
    reset,
    recording,
    startRecording,
    stopRecording,
    clipUrl,
    setClipUrl,
    analyzeClip,
    replaying,
  };
}
