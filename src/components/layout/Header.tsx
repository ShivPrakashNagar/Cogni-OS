import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import { cn } from '@/lib/utils';
import {
  Menu, Search, Plus, Sun, Moon, ChevronRight,
  Zap, FolderKanban, BookOpen, Library, X,
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const quickAddOptions = [
  { label: 'Add Skill', icon: Zap, path: '/skills?add=true' },
  { label: 'Add Course', icon: BookOpen, path: '/academics?tab=courses&add=true' },
  { label: 'Add Project', icon: FolderKanban, path: '/projects-resumes?add=true' },
  { label: 'Add Book / Library Item', icon: Library, path: '/library?add=true' },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/skills': 'Skills',
  '/academics': 'Academics',
  '/projects-resumes': 'Projects & Resumes',
  '/library': 'Library',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { skills, projects, courses, library, settings, setSettings } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setQuickAddOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) setQuickAddOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search results — actual filtering
  const searchResults = searchQuery.trim().length > 1
    ? [
        ...skills.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((s) => ({ type: 'Skill' as const, name: s.name, path: '/skills' })),
        ...projects.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => ({ type: 'Project' as const, name: p.title, path: '/projects-resumes' })),
        ...courses.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map((c) => ({ type: 'Course' as const, name: c.title, path: '/academics?tab=courses' })),
        ...library.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase())).map((l) => ({ type: 'Library' as const, name: l.title, path: '/library' })),
      ].slice(0, 8)
    : [];

  const toggleTheme = () => {
    setSettings((s) => ({
      ...s,
      theme: s.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const breadcrumb = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 h-16 bg-white/80 dark:bg-dark-50/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-300 print:hidden">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-200 text-gray-500"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
        <span>CogniOs</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">{breadcrumb}</span>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-lg mx-auto" ref={searchRef}>
        <div className="relative">
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-sm transition-all',
              searchOpen
                ? 'bg-white dark:bg-dark-200 border-brand-300 dark:border-brand-700 ring-2 ring-brand-500/20'
                : 'bg-gray-50 dark:bg-dark-200 border-gray-200 dark:border-dark-400 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-dark-500'
            )}
          >
            <Search className="w-4 h-4 shrink-0" />
            {searchOpen ? (
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, projects, courses, notes..."
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                aria-label="Global search"
              />
            ) : (
              <span className="flex-1 text-left">Search skills, projects, courses, notes...</span>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-300 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Search results dropdown */}
          {searchOpen && searchQuery.trim().length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-100 border border-gray-200 dark:border-dark-300 rounded-xl shadow-lg overflow-hidden animate-scale-in z-50">
              {searchResults.length > 0 ? (
                <div className="py-1.5">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { navigate(r.path); setSearchOpen(false); setSearchQuery(''); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                    >
                      <span className="badge bg-gray-100 dark:bg-dark-300 text-gray-500 dark:text-gray-400 text-[10px]">{r.type}</span>
                      <span className="text-gray-800 dark:text-gray-200">{r.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Quick Add */}
        <div className="relative" ref={quickAddRef}>
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="btn-primary !px-3 !py-2 text-xs"
            aria-label="Quick add"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>
          {quickAddOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-100 border border-gray-200 dark:border-dark-300 rounded-xl shadow-lg overflow-hidden animate-scale-in z-50">
              <div className="py-1.5">
                {quickAddOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.path}
                      onClick={() => {
                        setQuickAddOpen(false);
                        navigate(opt.path);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-200 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label="Toggle theme"
        >
          {settings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
