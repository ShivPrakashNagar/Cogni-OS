// ============================================================
// CogniOs Application State Hook — Central state management
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type {
  Skill, Project, Course, AcademicSubject,
  ResumeProfile, LibraryItem, ActivityItem, Notification,
  AppSettings, UserProfile,
} from '@/types';
import storage, { KEYS } from '@/lib/storage';
import {
  seedSkills, seedProjects, seedCourses,
  seedAcademics, seedResumes, seedLibrary, seedActivity,
  seedNotifications, seedSettings, seedProfile,
} from '@/data/seed';
import { generateId } from '@/lib/utils';

function initializeStore() {
  // Run migration first for existing data
  if (storage.isInitialized()) {
    storage.migrate();
  }

  if (!storage.isInitialized()) {
    storage.set(KEYS.skills, seedSkills);
    storage.set(KEYS.projects, seedProjects);
    storage.set(KEYS.courses, seedCourses);
    storage.set(KEYS.academics, seedAcademics);
    storage.set(KEYS.resumes, seedResumes);
    storage.set(KEYS.library, seedLibrary);
    storage.set(KEYS.activity, seedActivity);
    storage.set(KEYS.notifications, seedNotifications);
    storage.set(KEYS.settings, seedSettings);
    storage.set(KEYS.profile, seedProfile);
    storage.markInitialized();
  }
}

export function useAppState() {
  initializeStore();

  const [skills, setSkillsState] = useState<Skill[]>(() => storage.get(KEYS.skills, seedSkills));
  const [projects, setProjectsState] = useState<Project[]>(() => storage.get(KEYS.projects, seedProjects));
  const [courses, setCoursesState] = useState<Course[]>(() => storage.get(KEYS.courses, seedCourses));
  const [academics, setAcademicsState] = useState<AcademicSubject[]>(() => storage.get(KEYS.academics, seedAcademics));
  const [resumes, setResumesState] = useState<ResumeProfile[]>(() => storage.get(KEYS.resumes, seedResumes));
  const [library, setLibraryState] = useState<LibraryItem[]>(() => storage.get(KEYS.library, seedLibrary));
  const [activity, setActivityState] = useState<ActivityItem[]>(() => storage.get(KEYS.activity, seedActivity));
  const [notifications, setNotificationsState] = useState<Notification[]>(() => storage.get(KEYS.notifications, seedNotifications));
  const [settings, setSettingsState] = useState<AppSettings>(() => storage.get(KEYS.settings, seedSettings));
  const [profile, setProfileState] = useState<UserProfile>(() => storage.get(KEYS.profile, seedProfile));

  // Persist helpers
  const setSkills = useCallback((updater: Skill[] | ((prev: Skill[]) => Skill[])) => {
    setSkillsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.set(KEYS.skills, next);
      return next;
    });
  }, []);
  const setProjects = useCallback((updater: Project[] | ((prev: Project[]) => Project[])) => {
    setProjectsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.set(KEYS.projects, next);
      return next;
    });
  }, []);
  const setCourses = useCallback((updater: Course[] | ((prev: Course[]) => Course[])) => {
    setCoursesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.set(KEYS.courses, next);
      return next;
    });
  }, []);
  const setAcademics = useCallback((updater: AcademicSubject[] | ((prev: AcademicSubject[]) => AcademicSubject[])) => {
    setAcademicsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.set(KEYS.academics, next);
      return next;
    });
  }, []);
  const setResumes = useCallback((updater: ResumeProfile[] | ((prev: ResumeProfile[]) => ResumeProfile[])) => {
    setResumesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.set(KEYS.resumes, next);
      return next;
    });
  }, []);
  const setLibrary = useCallback((updater: LibraryItem[] | ((prev: LibraryItem[]) => LibraryItem[])) => {
    setLibraryState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.set(KEYS.library, next);
      return next;
    });
  }, []);
  const setSettings = useCallback((updater: AppSettings | ((prev: AppSettings) => AppSettings)) => {
    setSettingsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.set(KEYS.settings, next);
      return next;
    });
  }, []);
  const setProfile = useCallback((updater: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setProfileState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.set(KEYS.profile, next);
      return next;
    });
  }, []);
  const setNotifications = useCallback((updater: Notification[] | ((prev: Notification[]) => Notification[])) => {
    setNotificationsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storage.set(KEYS.notifications, next);
      return next;
    });
  }, []);

  // Activity logging
  const addActivity = useCallback((type: ActivityItem['type'], action: string, entityName: string) => {
    setActivityState((prev) => {
      const item: ActivityItem = { id: generateId(), type, action, entityName, timestamp: new Date().toISOString() };
      const next = [item, ...prev].slice(0, 50);
      storage.set(KEYS.activity, next);
      return next;
    });
  }, []);

  // Toast state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // Theme
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      if (settings.theme === 'dark' || (settings.theme === 'system' && mediaQuery.matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [settings.theme]);

  // Data export / import
  const exportData = useCallback(() => {
    return storage.exportAll();
  }, []);

  const importData = useCallback((json: string): boolean => {
    const success = storage.importAll(json);
    if (success) {
      setSkillsState(storage.get(KEYS.skills, seedSkills));
      setProjectsState(storage.get(KEYS.projects, seedProjects));
      setCoursesState(storage.get(KEYS.courses, seedCourses));
      setAcademicsState(storage.get(KEYS.academics, seedAcademics));
      setResumesState(storage.get(KEYS.resumes, seedResumes));
      setLibraryState(storage.get(KEYS.library, seedLibrary));
      setActivityState(storage.get(KEYS.activity, seedActivity));
      setNotificationsState(storage.get(KEYS.notifications, seedNotifications));
      setSettingsState(storage.get(KEYS.settings, seedSettings));
      setProfileState(storage.get(KEYS.profile, seedProfile));
    }
    return success;
  }, []);

  const resetData = useCallback(() => {
    storage.clear();
    storage.set(KEYS.skills, seedSkills);
    storage.set(KEYS.projects, seedProjects);
    storage.set(KEYS.courses, seedCourses);
    storage.set(KEYS.academics, seedAcademics);
    storage.set(KEYS.resumes, seedResumes);
    storage.set(KEYS.library, seedLibrary);
    storage.set(KEYS.activity, seedActivity);
    storage.set(KEYS.notifications, seedNotifications);
    storage.set(KEYS.settings, seedSettings);
    storage.set(KEYS.profile, seedProfile);
    storage.markInitialized();
    setSkillsState(seedSkills);
    setProjectsState(seedProjects);
    setCoursesState(seedCourses);
    setAcademicsState(seedAcademics);
    setResumesState(seedResumes);
    setLibraryState(seedLibrary);
    setActivityState(seedActivity);
    setNotificationsState(seedNotifications);
    setSettingsState(seedSettings);
    setProfileState(seedProfile);
  }, []);

  return {
    skills, setSkills,
    projects, setProjects,
    courses, setCourses,
    academics, setAcademics,
    resumes, setResumes,
    library, setLibrary,
    activity, addActivity,
    notifications, setNotifications,
    settings, setSettings,
    profile, setProfile,
    toasts, addToast,
    exportData, importData, resetData,
  };
}

export type AppState = ReturnType<typeof useAppState>;
