/** Local-only clip queue: video blobs stay on-device in IndexedDB. */
export type QueuedClip = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  createdAt: string;
  durationSec: number;
  size: number;
  analyzed: boolean;
  blob: Blob;
};

export type ClipMeta = Omit<QueuedClip, "blob">;

const DB = "motionmate";
const STORE = "clips";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE))
        db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function addClip(clip: QueuedClip) {
  await tx("readwrite", (s) => s.put(clip));
}

export async function listClips(): Promise<ClipMeta[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    const all = await tx<QueuedClip[]>("readonly", (s) => s.getAll());
    return all
      .map(({ blob: _blob, ...meta }) => meta)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function getClip(id: string): Promise<QueuedClip | undefined> {
  return tx<QueuedClip | undefined>("readonly", (s) => s.get(id));
}

export async function markAnalyzed(id: string) {
  const c = await getClip(id);
  if (c) await addClip({ ...c, analyzed: true });
}

export async function deleteClip(id: string) {
  await tx("readwrite", (s) => s.delete(id));
}

export async function storageEstimate(): Promise<{ usedMb: number; quotaMb: number } | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  const e = await navigator.storage.estimate();
  return {
    usedMb: Math.round(((e.usage ?? 0) / 1048576) * 10) / 10,
    quotaMb: Math.round((e.quota ?? 0) / 1048576),
  };
}

export function formatMb(bytes: number) {
  return `${Math.max(0.1, Math.round((bytes / 1048576) * 10) / 10)} MB`;
}

export function formatClock(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
