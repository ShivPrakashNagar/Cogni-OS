// ============================================================
// CogniOs Authentication & Security Engine
// Real SHA-256 hashing, session management, and per-user accounts
// ============================================================

import type { UserAccount, AuthSession } from '@/types';
import { generateId } from './utils';

const STORAGE_USERS_KEY = 'cognios_users_db';
const STORAGE_SESSION_KEY = 'cognios_auth_session';

// Standard native SHA-256 password hashing
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Get all registered users from storage
export function getUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserAccount[];
  } catch {
    return [];
  }
}

// Save or update a user account in storage
export function saveUser(user: UserAccount): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (index >= 0) {
    users[index] = { ...users[index], ...user, updatedAt: new Date().toISOString() };
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

// Find user by email
export function findUserByEmail(email: string): UserAccount | undefined {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

// Session management
export function getActiveSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setActiveSession(session: AuthSession | null): void {
  if (!session) {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } else {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
  }
}

export function clearActiveSession(): void {
  localStorage.removeItem(STORAGE_SESSION_KEY);
}

// Ensure default demo user exists
export async function ensureDemoUser(): Promise<UserAccount> {
  const existing = findUserByEmail('shiv.dhakad@example.com');
  if (existing) return existing;

  const demoHash = await hashPassword('password123');
  const now = new Date().toISOString();
  const demoUser: UserAccount = {
    id: 'user-shiv-demo',
    name: 'Shiv Dhakad',
    email: 'shiv.dhakad@example.com',
    passwordHash: demoHash,
    title: 'Java Full Stack Developer',
    avatarInitials: 'SD',
    createdAt: now,
    updatedAt: now,
  };
  saveUser(demoUser);
  return demoUser;
}
