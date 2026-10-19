const PREFIX = 'lulu3d';

export type StoredEnvelope<T> = {
  version: number;
  savedAt: string;
  data: T;
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readStorage<T>(key: string, version: number): T | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${PREFIX}:${key}`);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredEnvelope<T>;
    if (!parsed || parsed.version !== version || parsed.data === undefined) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeStorage<T>(key: string, version: number, data: T): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    const envelope: StoredEnvelope<T> = {
      version,
      savedAt: new Date().toISOString(),
      data,
    };
    window.localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(envelope));
  } catch {
    // Storage can be full or blocked. Persistence is best-effort only.
  }
}

export function clearStorage(key: string): void {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.removeItem(`${PREFIX}:${key}`);
  } catch {
    // ignore
  }
}
