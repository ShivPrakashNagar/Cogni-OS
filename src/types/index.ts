// ============================================================
// CogniOs Type Definitions - aligned with PRD
// ============================================================

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Mastered';
export type SkillCategory = 'Backend' | 'Frontend' | 'Full Stack' | 'Database/DevOps' | 'AI';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  playbook: {
    bestFor: string;
    tradeoffs: string;
    alternatives: string;
  };
  proofOfWorkUrl?: string;
  liveUrl?: string;
  learningNotes?: string;
  relatedProjectIds?: string[];
  relatedCourseIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  problem?: string;
  solution?: string;
  architecture?: string;
  features?: string;
  role?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CourseStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Paused';

export interface Course {
  id: string;
  title: string;
  platform: string;
  progressPercentage: number;
  status: CourseStatus;
  certificateUrl?: string;
  courseUrl?: string;
  instructor?: string;
  type?: string;
  totalDuration?: string;
  completedDuration?: string;
  lastStudied?: string;
  createdAt: string;
  updatedAt: string;
}

export type AcademicStatus = 'Completed' | 'In Progress' | 'Upcoming';

export interface AcademicSubject {
  id: string;
  semester: number;
  subject: string;
  credits: number;
  grade: string;
  score: number;
  status: AcademicStatus;
  createdAt: string;
  updatedAt: string;
}

// Alias for backward compatibility
export type AcademicRecord = AcademicSubject;

export interface ResumeProfile {
  id: string;
  roleTitle: string;
  targetSummary: string;
  selectedSkillIds: string[];
  selectedProjectIds: string[];
  selectedSubjectIds: string[];
  selectedCourseIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type LibraryStatus = 'Queued' | 'Reading' | 'Finished';
export type LibraryCategory = 'Books' | 'Documentation' | 'Technical Notes' | 'Interview Q&A' | 'Code Snippets' | 'Architecture' | 'AI Notes' | 'Learning Notes';

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  status: LibraryStatus;
  resourceUrl?: string;
  takeawaysMarkdown: string;
  category?: string;
  tags: string[];
  importantConcepts?: string;
  codeSnippets?: string;
  interviewQuestions?: string;
  personalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'skill' | 'project' | 'course' | 'academic' | 'resume' | 'library' | 'settings';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  action: string;
  entityName: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'info' | 'success' | 'warning';
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultPage: string;
  sidebarCollapsed: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  title: string;
  avatarInitials: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  phone?: string;
}
