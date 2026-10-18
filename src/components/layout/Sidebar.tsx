import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Zap, GraduationCap, FolderKanban,
  Library, Moon, Sun, X, Brain, Monitor,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/skills', icon: Zap, label: 'Skills' },
  { to: '/academics', icon: GraduationCap, label: 'Academics' },
  { to: '/projects-resumes', icon: FolderKanban, label: 'Projects & Resumes' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, setSettings } = useApp();

  const toggleTheme = () => {
    setSettings((s) => ({
      ...s,
      theme: s.theme === 'light' ? 'dark' : s.theme === 'dark' ? 'system' : 'light',
    }));
  };

  const ThemeIcon = settings.theme === 'dark' ? Moon : settings.theme === 'system' ? Monitor : Sun;
  const themeLabel = settings.theme === 'dark' ? 'Dark' : settings.theme === 'light' ? 'Light' : 'System';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-50 h-screen w-[260px] flex flex-col print:hidden',
          'bg-white dark:bg-dark-50 border-r border-gray-100 dark:border-dark-300',
          'transition-transform duration-300 ease-in-out md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo — clickable → /dashboard */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <button
            onClick={() => { navigate('/dashboard'); onClose(); }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label="Navigate to Dashboard"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">CogniOs</h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wider uppercase">by Shiv Dhakad</p>
            </div>
          </button>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 text-gray-400"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation — exactly 5 items per PRD */}
        <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Main navigation">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-200 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={cn('w-[18px] h-[18px]', isActive ? 'text-brand-600 dark:text-brand-400' : '')} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom section — theme toggle + user */}
        <div className="px-3 pb-4 space-y-1 border-t border-gray-100 dark:border-dark-300 pt-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
            aria-label={`Toggle theme (currently ${themeLabel})`}
          >
            <ThemeIcon className="w-[18px] h-[18px]" />
            {themeLabel} Mode
          </button>

          {/* User profile */}
          <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white">
              SD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Shiv Dhakad</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">Java Full Stack Developer</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
