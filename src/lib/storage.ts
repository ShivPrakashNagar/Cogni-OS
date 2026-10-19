// ============================================================
// CogniOs localStorage Storage Engine â€” with migration support
// ============================================================

const STORAGE_PREFIX = 'cognios_';
const SCHEMA_VERSION = 2; // Bumped for PRD alignment

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

// Migration: convert old schema to new PRD-aligned schema
function migrateData(): void {
  const currentVersion = safeGet<number>(KEYS.schemaVersion, 1);
  if (currentVersion >= SCHEMA_VERSION) return;

  console.log(`[CogniOs] Migrating from schema v${currentVersion} to v${SCHEMA_VERSION}`);

  // Migrate skills: old field names â†’ new PRD names
  const oldSkills = safeGet<any[]>(KEYS.skills, []);
  if (oldSkills.length > 0 && oldSkills[0].proficiencyLevel !== undefined) {
    const migrated = oldSkills.map((s: any) => {
      // Map old categories to new
      let category = s.category;
      if (category === 'Databases & DevOps') category = 'Database/DevOps';
      if (category === 'AI & Tools') category = 'AI';
      if (category === 'Soft Skills') category = 'Full Stack';

      // Map proficiency
      let proficiency = s.proficiencyLevel || s.proficiency || 'Beginner';
      if (proficiency === 'Production Ready') proficiency = 'Mastered';

      return {
        ...s,
        category,
        proficiency,
        playbook: s.playbook || {
          bestFor: s.bestFor || '',
          tradeoffs: s.tradeOffs || s.tradeoffs || '',
          alternatives: s.alternatives || '',
        },
        proofOfWorkUrl: s.proofOfWorkUrl || s.proofOfWork || s.repoUrl || '',
        // Remove old fields
        proficiencyLevel: undefined,
        bestFor: undefined,
        tradeOffs: undefined,
        repoUrl: undefined,
        proofOfWork: undefined,
      };
    });
    safeSet(KEYS.skills, migrated);
  }

  // Migrate projects: stack â†’ techStack
  const oldProjects = safeGet<any[]>(KEYS.projects, []);
  if (oldProjects.length > 0 && oldProjects[0].stack !== undefined) {
    const migrated = oldProjects.map((p: any) => ({
      ...p,
      techStack: p.techStack || p.stack || [],
      githubUrl: p.githubUrl || '',
      liveUrl: p.liveUrl || '',
      stack: undefined,
      status: undefined,
      progress: undefined,
    }));
    safeSet(KEYS.projects, migrated);
  }

  // Migrate academics: subjectName -> subject
  const oldAcademics = safeGet<any[]>(KEYS.academics, []);
  if (oldAcademics.length > 0 && oldAcademics[0].subjectName !== undefined && oldAcademics[0].subject === undefined) {
    const migrated = oldAcademics.map((a: any) => ({
      ...a,
      subject: a.subject || a.subjectName || '',
    }));
    safeSet(KEYS.academics, migrated);
  }

  // Migrate resumes: jobRoleName â†’ roleTitle, summary â†’ targetSummary
  const oldResumes = safeGet<any[]>(KEYS.resumes, []);
  if (oldResumes.length > 0 && oldResumes[0].jobRoleName !== undefined) {
    const migrated = oldResumes.map((r: any) => ({
      ...r,
      roleTitle: r.roleTitle || r.jobRoleName || '',
      targetSummary: r.targetSummary || r.summary || '',
      selectedSubjectIds: r.selectedSubjectIds || [],
      jobRoleName: undefined,
      summary: undefined,
    }));
    safeSet(KEYS.resumes, migrated);
  }

  // Migrate library: keyTakeawaysMarkdown â†’ takeawaysMarkdown, status mapping
  const oldLibrary = safeGet<any[]>(KEYS.library, []);
  if (oldLibrary.length > 0) {
    const migrated = oldLibrary.map((l: any) => ({
      ...l,
      takeawaysMarkdown: l.takeawaysMarkdown || l.keyTakeawaysMarkdown || '',
      status: l.status === 'Want to Read' ? 'Queued' : l.status,
    }));
    safeSet(KEYS.library, migrated);
  }

  // Migrate profile: add new fields
  const oldProfile = safeGet<any>(KEYS.profile, null);
  if (oldProfile && oldProfile.github === undefined) {
    safeSet(KEYS.profile, {
      ...oldProfile,
      github: oldProfile.github || '',
      linkedin: oldProfile.linkedin || '',
      portfolio: oldProfile.portfolio || '',
      phone: oldProfile.phone || '',
    });
  }

  // Remove old AI tools key
  localStorage.removeItem(`${STORAGE_PREFIX}ai_tools`);

  safeSet(KEYS.schemaVersion, SCHEMA_VERSION);
  console.log('[CogniOs] Migration complete.');
}

export const storage = {
  get: safeGet,
  set: safeSet,
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
  migrate: migrateData,
  exportAll: (): string => {
    const data: Record<string, unknown> = {};
    Object.entries(KEYS).forEach(([name, key]) => {
      if (name !== 'initialized' && name !== 'schemaVersion') {
        data[name] = safeGet(key, null);
      }
    });
    return JSON.stringify(data, null, 2);
  },
  importAll: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid data format');
      }
      Object.entries(KEYS).forEach(([name, key]) => {
        if (name !== 'initialized' && name !== 'schemaVersion' && data[name] !== undefined) {
          safeSet(key, data[name]);
        }
      });
      safeSet(KEYS.initialized, true);
      safeSet(KEYS.schemaVersion, SCHEMA_VERSION);
      return true;
    } catch {
      return false;
    }
  },
  KEYS,
};

export default storage;

