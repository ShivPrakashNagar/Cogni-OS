import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Projects from './Projects';
import Resume from './Resume';
import { FolderKanban, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectsResumes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'projects' | 'resume'>('projects');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'resume') setActiveTab('resume');
    else if (tab === 'projects') setActiveTab('projects');
  }, [searchParams]);

  const handleTabChange = (tab: 'projects' | 'resume') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Projects & Resumes</h1>
        <p className="page-subtitle">Showcase your work and build tailored resumes.</p>
      </div>

      <div className="flex border-b border-gray-200 dark:border-dark-300">
        <button
          onClick={() => handleTabChange('projects')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors',
            activeTab === 'projects'
              ? 'border-brand-500 text-brand-700 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <FolderKanban className="w-4 h-4" />
          Projects Portfolio
        </button>
        <button
          onClick={() => handleTabChange('resume')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors',
            activeTab === 'resume'
              ? 'border-brand-500 text-brand-700 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <FileText className="w-4 h-4" />
          Resume Builder
        </button>
      </div>

      <div className="pt-2">
        {activeTab === 'projects' ? <Projects /> : <Resume />}
      </div>
    </div>
  );
}
