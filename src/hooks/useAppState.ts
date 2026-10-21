// ============================================================
// CogniOs Application State Hook — Central state management & Auth
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type {
  Skill, Project, Course, AcademicSubject,
  ResumeProfile, LibraryItem, ActivityItem, Notification,
  AppSettings, UserProfile, AuthSession, UserAccount,
} from '@/types';
import storage, { KEYS, getUserScoped, setUserScoped } from '@/lib/storage';
import {
  seedSkills, seedProjects, seedCourses,
  seedAcademics, seedResumes, seedLibrary, seedActivity,
  seedNotifications, seedSettings, seedProfile,
} from '@/data/seed';
import { generateId } from '@/lib/utils';
import {
  getActiveSession, setActiveSession, clearActiveSession,
  findUserByEmail, saveUser, hashPassword, ensureDemoUser,
} from '@/lib/auth';

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return 'SD';
}

export function useAppState() {
  // Ensure default demo user exists in storage
  useEffect(() => {
    ensureDemoUser();
  }, []);

  // Authentication session state
  const [session, setSessionState] = useState<AuthSession | null>(() => {
    const active = getActiveSession();
    if (active) return active;
    // Default to demo session so current users are smoothly logged in
    return {
      userId: 'user-shiv-demo',
      email: 'shiv.dhakad@example.com',
      name: 'Shiv Dhakad',
      title: 'Java Full Stack Developer',
      avatarInitials: 'SD',
      token: 'demo-session-token',
      loginAt: new Date().toISOString(),
    };
  });

  const currentUserId = session?.userId || 'user-shiv-demo';
  const isDemo = currentUserId === 'user-shiv-demo';

  // State hooks scoped to active user
  const [skills, setSkillsState] = useState<Skill[]>(() =>
    getUserScoped(KEYS.skills, currentUserId, isDemo ? seedSkills : [])
  );
  const [projects, setProjectsState] = useState<Project[]>(() =>
    getUserScoped(KEYS.projects, currentUserId, isDemo ? seedProjects : [])
  );
  const [courses, setCoursesState] = useState<Course[]>(() =>
    getUserScoped(KEYS.courses, currentUserId, isDemo ? seedCourses : [])
  );
  const [academics, setAcademicsState] = useState<AcademicSubject[]>(() =>
    getUserScoped(KEYS.academics, currentUserId, isDemo ? seedAcademics : [])
  );
  const [resumes, setResumesState] = useState<ResumeProfile[]>(() =>
    getUserScoped(KEYS.resumes, currentUserId, isDemo ? seedResumes : [])
  );
  const [library, setLibraryState] = useState<LibraryItem[]>(() =>
    getUserScoped(KEYS.library, currentUserId, isDemo ? seedLibrary : [])
  );
  const [activity, setActivityState] = useState<ActivityItem[]>(() =>
    getUserScoped(KEYS.activity, currentUserId, isDemo ? seedActivity : [])
  );
  const [notifications, setNotificationsState] = useState<Notification[]>(() =>
    getUserScoped(KEYS.notifications, currentUserId, isDemo ? seedNotifications : [])
  );
  const [settings, setSettingsState] = useState<AppSettings>(() =>
    getUserScoped(KEYS.settings, currentUserId, seedSettings)
  );
  const [profile, setProfileState] = useState<UserProfile>(() =>
    getUserScoped(KEYS.profile, currentUserId, {
      ...seedProfile,
      name: session?.name || seedProfile.name,
      email: session?.email || seedProfile.email,
      title: session?.title || seedProfile.title,
      avatarInitials: session?.avatarInitials || seedProfile.avatarInitials,
    })
  );

  // Reload data whenever active user session changes
  const reloadUserData = useCallback((userSession: AuthSession | null) => {
    if (!userSession) {
      setSkillsState([]);
      setProjectsState([]);
      setCoursesState([]);
      setAcademicsState([]);
      setResumesState([]);
      setLibraryState([]);
      setActivityState([]);
      setNotificationsState([]);
      setSettingsState(seedSettings);
      setProfileState(seedProfile);
      return;
    }

    const uId = userSession.userId;
    const isDemoAccount = uId === 'user-shiv-demo';

    setSkillsState(getUserScoped(KEYS.skills, uId, isDemoAccount ? seedSkills : []));
    setProjectsState(getUserScoped(KEYS.projects, uId, isDemoAccount ? seedProjects : []));
    setCoursesState(getUserScoped(KEYS.courses, uId, isDemoAccount ? seedCourses : []));
    setAcademicsState(getUserScoped(KEYS.academics, uId, isDemoAccount ? seedAcademics : []));
    setResumesState(getUserScoped(KEYS.resumes, uId, isDemoAccount ? seedResumes : []));
    setLibraryState(getUserScoped(KEYS.library, uId, isDemoAccount ? seedLibrary : []));
    setActivityState(getUserScoped(KEYS.activity, uId, isDemoAccount ? seedActivity : []));
    setNotificationsState(getUserScoped(KEYS.notifications, uId, isDemoAccount ? seedNotifications : []));
    setSettingsState(getUserScoped(KEYS.settings, uId, seedSettings));
    setProfileState(
      getUserScoped(KEYS.profile, uId, {
        ...seedProfile,
        name: userSession.name,
        email: userSession.email,
        title: userSession.title || 'Full Stack Developer',
        avatarInitials: userSession.avatarInitials || getInitials(userSession.name),
      })
    );
  }, []);

  // Toasts system
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Persistent user-scoped updaters
  const setSkills = useCallback((updater: Skill[] | ((prev: Skill[]) => Skill[])) => {
    setSkillsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (session) setUserScoped(KEYS.skills, session.userId, next);
      return next;
    });
  }, [session]);

  const setProjects = useCallback((updater: Project[] | ((prev: Project[]) => Project[])) => {
    setProjectsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (session) setUserScoped(KEYS.projects, session.userId, next);
      return next;
    });
  }, [session]);

  const setCourses = useCallback((updater: Course[] | ((prev: Course[]) => Course[])) => {
    setCoursesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (session) setUserScoped(KEYS.courses, session.userId, next);
      return next;
    });
  }, [session]);

  const setAcademics = useCallback((updater: AcademicSubject[] | ((prev: AcademicSubject[]) => AcademicSubject[])) => {
    setAcademicsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (session) setUserScoped(KEYS.academics, session.userId, next);
      return next;
    });
  }, [session]);

  const setResumes = useCallback((updater: ResumeProfile[] | ((prev: ResumeProfile[]) => ResumeProfile[])) => {
    setResumesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (session) setUserScoped(KEYS.resumes, session.userId, next);
      return next;
    });
  }, [session]);

  const setLibrary = useCallback((updater: LibraryItem[] | ((prev: LibraryItem[]) => LibraryItem[])) => {
    setLibraryState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (session) setUserScoped(KEYS.library, session.userId, next);
      return next;
    });
  }, [session]);

  const addActivity = useCallback((type: ActivityItem['type'], action: string, entityName: string) => {
    const item: ActivityItem = {
      id: generateId(),
      type,
      action,
      entityName,
      timestamp: new Date().toISOString(),
    };
    setActivityState((prev) => {
      const next = [item, ...prev].slice(0, 50);
      if (session) setUserScoped(KEYS.activity, session.userId, next);
      return next;
    });
  }, [session]);

  const setNotifications = useCallback((updater: Notification[] | ((prev: Notification[]) => Notification[])) => {
    setNotificationsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (session) setUserScoped(KEYS.notifications, session.userId, next);
      return next;
    });
  }, [session]);

  const setSettings = useCallback((updater: AppSettings | ((prev: AppSettings) => AppSettings)) => {
    setSettingsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (session) setUserScoped(KEYS.settings, session.userId, next);
      return next;
    });
  }, [session]);

  const setProfile = useCallback((updater: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setProfileState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (session) setUserScoped(KEYS.profile, session.userId, next);
      return next;
    });
  }, [session]);

  // Auth Operations
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await ensureDemoUser();
    const user = findUserByEmail(email);
    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    const inputHash = await hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const newSession: AuthSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      title: user.title,
      avatarInitials: user.avatarInitials,
      token: `token-${Date.now()}-${generateId()}`,
      loginAt: new Date().toISOString(),
    };

    setActiveSession(newSession);
    setSessionState(newSession);
    reloadUserData(newSession);
    addToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
    return { success: true };
  }, [addToast, reloadUserData]);

  const register = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    title?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const existing = findUserByEmail(data.email);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPassword(data.password);
    const now = new Date().toISOString();
    const initials = getInitials(data.name);
    const userId = `user-${generateId()}`;

    const newUser: UserAccount = {
      id: userId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash,
      title: (data.title || 'Full Stack Developer').trim(),
      avatarInitials: initials,
      createdAt: now,
      updatedAt: now,
    };

    saveUser(newUser);

    // Initialize fresh profile for new user
    const newProfile: UserProfile = {
      name: newUser.name,
      email: newUser.email,
      title: newUser.title,
      avatarInitials: newUser.avatarInitials,
      github: '',
      linkedin: '',
      portfolio: '',
      phone: '',
    };
    setUserScoped(KEYS.profile, userId, newProfile);
    setUserScoped(KEYS.skills, userId, []);
    setUserScoped(KEYS.projects, userId, []);
    setUserScoped(KEYS.courses, userId, []);
    setUserScoped(KEYS.academics, userId, []);
    setUserScoped(KEYS.resumes, userId, []);
    setUserScoped(KEYS.library, userId, []);
    setUserScoped(KEYS.activity, userId, [
      {
        id: generateId(),
        type: 'auth',
        action: 'Created account',
        entityName: newUser.name,
        timestamp: now,
      },
    ]);

    const newSession: AuthSession = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      title: newUser.title,
      avatarInitials: newUser.avatarInitials,
      token: `token-${Date.now()}-${generateId()}`,
      loginAt: now,
    };

    setActiveSession(newSession);
    setSessionState(newSession);
    reloadUserData(newSession);
    addToast(`Account created! Welcome, ${newUser.name.split(' ')[0]}!`, 'success');
    return { success: true };
  }, [addToast, reloadUserData]);

  const loginAsDemo = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    return login('shiv.dhakad@example.com', 'password123');
  }, [login]);

  const logout = useCallback(() => {
    clearActiveSession();
    setSessionState(null);
    reloadUserData(null);
    addToast('You have been securely signed out.', 'info');
  }, [addToast, reloadUserData]);

  // Export / Import data for current user
  const exportData = useCallback(() => {
    return storage.exportAll(session?.userId);
  }, [session]);

  const importData = useCallback((jsonString: string) => {
    const success = storage.importAll(jsonString, session?.userId);
    if (success && session) {
      reloadUserData(session);
    }
    return success;
  }, [session, reloadUserData]);

  const resetData = useCallback(() => {
    if (!session) return;
    const uId = session.userId;
    const isDemoAccount = uId === 'user-shiv-demo';

    setUserScoped(KEYS.skills, uId, isDemoAccount ? seedSkills : []);
    setUserScoped(KEYS.projects, uId, isDemoAccount ? seedProjects : []);
    setUserScoped(KEYS.courses, uId, isDemoAccount ? seedCourses : []);
    setUserScoped(KEYS.academics, uId, isDemoAccount ? seedAcademics : []);
    setUserScoped(KEYS.resumes, uId, isDemoAccount ? seedResumes : []);
    setUserScoped(KEYS.library, uId, isDemoAccount ? seedLibrary : []);
    setUserScoped(KEYS.activity, uId, isDemoAccount ? seedActivity : []);
    setUserScoped(KEYS.notifications, uId, isDemoAccount ? seedNotifications : []);
    setUserScoped(KEYS.settings, uId, seedSettings);
    reloadUserData(session);
  }, [session, reloadUserData]);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  return {
    session,
    isAuthenticated: !!session,
    login,
    register,
    logout,
    loginAsDemo,
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
