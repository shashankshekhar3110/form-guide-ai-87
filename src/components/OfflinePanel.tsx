import { useCallback, useEffect, useState } from "react";
import {
  addClip,
  deleteClip,
  formatClock,
  formatMb,
  getClip,
  listClips,
  markAnalyzed,
  storageEstimate,
  type ClipMeta,
} from "@/lib/pose/offlineClips";

type Props = {
  exerciseId: string;
  exerciseName: string;
  recording: boolean;
  recordSeconds: number;
  clipBlob: Blob | null;
  onQueued: () => void;
  onAnalyze: (url: string) => void;
};

export function OfflinePanel({
  exerciseId,
  exerciseName,
  recording,
  recordSeconds,
  clipBlob,
  onQueued,
  onAnalyze,
}: Props) {
  const [clips, setClips] = useState<ClipMeta[]>([]);
  const [storage, setStorage] = useState<{ usedMb: number; quotaMb: number } | null>(null);
  const [online, setOnline] = useState(true);
  const [note, setNote] = useState("");

  const refresh = useCallback(async () => {
    setClips(await listClips());
    setStorage(await storageEstimate());
  }, []);

  useEffect(() => {
    void refresh();
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [refresh]);

  const queueClip = async () => {
    if (!clipBlob) return;
    await addClip({
      id: String(Date.now()),
      exerciseId,
      exerciseName,
      createdAt: new Date().toISOString(),
      durationSec: recordSeconds,
      size: clipBlob.size,
      analyzed: false,
      blob: clipBlob,
    });
    setNote("Saved on this device — analyse whenever you're ready.");
    onQueued();
    void refresh();
  };

  const analyze = async (id: string) => {
    const clip = await getClip(id);
    if (!clip) return;
    await markAnalyzed(id);
    onAnalyze(URL.createObjectURL(clip.blob));
    void refresh();
  };

  const pending = clips.filter((c) => !c.analyzed).length;

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Offline Locker</h2>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
            online ? "bg-secondary text-muted-foreground" : "bg-warning/20 text-warning"
          }`}
        >
          {online ? "Online" : "Offline"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-md border border-border px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Recording timer
          </p>
          <p className="stat-num text-2xl">{formatClock(recordSeconds)}</p>
        </div>
        {recording ? (
          <span className="flex items-center gap-2 text-xs font-semibold text-destructive">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
            REC
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Idle</span>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {pending} clip{pending === 1 ? "" : "s"} waiting · {clips.length} stored on device
        {storage ? ` · ${storage.usedMb} MB used of ${storage.quotaMb} MB` : ""}
      </p>

      {clipBlob && !recording && (
        <button
          onClick={queueClip}
          className="mt-3 h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground"
        >
          Analyze later · save {formatMb(clipBlob.size)} on device
        </button>
      )}
      {note && <p className="mt-2 text-xs text-primary">{note}</p>}

      <ul className="mt-4 space-y-2">
        {clips.slice(0, 5).map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{c.exerciseName}</p>
              <p className="text-xs text-muted-foreground">
                {formatClock(c.durationSec)} · {formatMb(c.size)} ·{" "}
                {c.analyzed ? "Analysed" : "Pending"}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => analyze(c.id)}
                className="h-8 rounded-md border border-primary px-3 text-xs font-semibold text-primary"
              >
                Analyse
              </button>
              <button
                onClick={async () => {
                  await deleteClip(c.id);
                  void refresh();
                }}
                className="h-8 rounded-md border border-border px-3 text-xs text-muted-foreground"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {clips.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          No saved clips yet. Record in Offline Mode — video never leaves this device.
        </p>
      )}
    </div>
  );
}
