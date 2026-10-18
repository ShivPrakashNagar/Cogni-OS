import React, { createContext, useContext, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppState, type AppState } from '@/hooks/useAppState';
import Layout from '@/components/layout/Layout';
import ToastContainer from '@/components/common/ToastContainer';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Skills = lazy(() => import('@/pages/Skills'));
const Academics = lazy(() => import('@/pages/Academics'));
const ProjectsResumes = lazy(() => import('@/pages/ProjectsResumes'));
const Library = lazy(() => import('@/pages/Library'));

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-brand-200 dark:border-brand-800 border-t-brand-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-400 dark:text-gray-500">Loading...</span>
      </div>
    </div>
  );
}

export default function App() {
  const appState = useAppState();

  return (
    <AppContext.Provider value={appState}>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/projects-resumes" element={<ProjectsResumes />} />
            <Route path="/library" element={<Library />} />
            {/* Redirect old routes for backward compatibility */}
            <Route path="/projects" element={<Navigate to="/projects-resumes" replace />} />
            <Route path="/resume" element={<Navigate to="/projects-resumes" replace />} />
            <Route path="/courses" element={<Navigate to="/academics" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Layout>
      <ToastContainer toasts={appState.toasts} />
    </AppContext.Provider>
  );
}
