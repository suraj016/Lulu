const PREFIX = 'lulu3d';

export type StoredEnvelope<T> = {
  version: number;
  savedAt: string;
  data: T;
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readStorageEnvelope(key: string): StoredEnvelope<unknown> | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${PREFIX}:${key}`);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredEnvelope<unknown>;
    if (!parsed || typeof parsed.version !== 'number' || parsed.data === undefined) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function readStorage<T>(key: string, version: number): T | null {
  const parsed = readStorageEnvelope(key);
  if (!parsed || parsed.version !== version) {
    return null;
  }
  return parsed.data as T;
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
