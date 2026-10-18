// ============================================================
// CogniOs Type Definitions — aligned with PRD
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
  // Preserved extra fields from existing implementation
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
  // Preserved extras
  problem?: string;
  solution?: string;
  architecture?: string;
  features?: string;
  role?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CourseStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Course {
  id: string;
  title: string;
  platform: string;
  progressPercentage: number;
  status: CourseStatus;
  certificateUrl?: string;
  courseUrl?: string;
  // Preserved extras
  instructor?: string;
  totalDuration?: string;
  completedDuration?: string;
  lastStudied?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSubject {
  id: string;
  semester: number;
  subjectName: string;
  credits: number;
  grade: string;
  // Preserved extras
  score?: number;
  status?: 'Completed' | 'In Progress' | 'Upcoming';
  createdAt: string;
  updatedAt: string;
}

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

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  status: LibraryStatus;
  resourceUrl?: string;
  takeawaysMarkdown: string;
  // Preserved extras for rich library
  category?: string;
  tags?: string[];
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
