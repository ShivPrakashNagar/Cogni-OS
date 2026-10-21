// ============================================================
// CogniOs localStorage Storage Engine — with multi-user isolation
// ============================================================

const STORAGE_PREFIX = 'cognios_';
const SCHEMA_VERSION = 3;

const KEYS = {
  skills: `${STORAGE_PREFIX}skills`,
  projects: `${STORAGE_PREFIX}projects`,
  courses: `${STORAGE_PREFIX}courses`,
  academics: `${STORAGE_PREFIX}academics`,
  resumes: `${STORAGE_PREFIX}resumes`,
  library: `${STORAGE_PREFIX}library`,
  activity: `${STORAGE_PREFIX}activity`,
  settings: `${STORAGE_PREFIX}settings`,
  notifications: `${STORAGE_PREFIX}notifications`,
  profile: `${STORAGE_PREFIX}profile`,
  initialized: `${STORAGE_PREFIX}initialized`,
  schemaVersion: `${STORAGE_PREFIX}schema_version`,
  usersDb: `${STORAGE_PREFIX}users_db`,
  activeSession: `${STORAGE_PREFIX}auth_session`,
} as const;

export { KEYS };

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[CogniOs] Corrupted localStorage key: ${key}, using fallback.`);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[CogniOs] Failed to write to localStorage key: ${key}`, e);
  }
}

// User-scoped keys for data isolation
export function getUserScopedKey(baseKey: string, userId: string): string {
  return `${baseKey}_${userId}`;
}

export function getUserScoped<T>(baseKey: string, userId: string, fallback: T): T {
  const userKey = getUserScopedKey(baseKey, userId);
  const raw = localStorage.getItem(userKey);
  if (raw !== null) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  // Fallback to global key for demo user backward compatibility
  if (userId === 'user-shiv-demo') {
    return safeGet<T>(baseKey, fallback);
  }

  return fallback;
}

export function setUserScoped<T>(baseKey: string, userId: string, value: T): void {
  const userKey = getUserScopedKey(baseKey, userId);
  safeSet(userKey, value);

  // Keep global key updated for demo user backward compatibility
  if (userId === 'user-shiv-demo') {
    safeSet(baseKey, value);
  }
}

export const storage = {
  get: safeGet,
  set: safeSet,
  getUserScoped,
  setUserScoped,
  remove: (key: string) => localStorage.removeItem(key),
  clear: () => {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },
  isInitialized: (): boolean => {
    return safeGet(KEYS.initialized, false);
  },
  markInitialized: () => {
    safeSet(KEYS.initialized, true);
  },
  exportAll: (userId?: string): string => {
    const data: Record<string, unknown> = {};
    Object.entries(KEYS).forEach(([name, key]) => {
      if (name !== 'initialized' && name !== 'schemaVersion') {
        data[name] = userId ? getUserScoped(key, userId, null) : safeGet(key, null);
      }
    });
    return JSON.stringify(data, null, 2);
  },
  importAll: (jsonString: string, userId?: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid data format');
      }
      Object.entries(KEYS).forEach(([name, key]) => {
        if (name !== 'initialized' && name !== 'schemaVersion' && data[name] !== undefined) {
          if (userId) {
            setUserScoped(key, userId, data[name]);
          } else {
            safeSet(key, data[name]);
          }
        }
      });
      safeSet(KEYS.initialized, true);
      return true;
    } catch {
      return false;
    }
  },
  KEYS,
};

export default storage;
