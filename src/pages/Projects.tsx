import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/App';
import type { Project } from '@/types';
import { generateId } from '@/lib/utils';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Plus, Search, Edit2, Trash2, ExternalLink, Github, Star, Eye } from 'lucide-react';

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects, setProjects, addActivity, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setAddOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filtered = projects.filter((p) => {
    if (
      search &&
      !p.title.toLowerCase().includes(search.toLowerCase()) &&
      !p.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase())) &&
      !(p.description || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const saveProject = (data: Partial<Project>) => {
    const now = new Date().toISOString();
    if (editProject) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editProject.id ? { ...p, ...data, updatedAt: now } : p))
      );
      addActivity('project', 'Updated project', data.title || editProject.title);
      addToast('Project updated successfully.', 'success');
      setEditProject(null);
    } else {
      const project: Project = {
        id: generateId(),
        title: (data.title || '').trim(),
        description: (data.description || '').trim(),
        techStack: data.techStack || [],
        githubUrl: (data.githubUrl || '').trim(),
        liveUrl: (data.liveUrl || '').trim(),
        featured: data.featured || false,
        problem: (data.problem || '').trim(),
        solution: (data.solution || '').trim(),
        architecture: (data.architecture || '').trim(),
        features: (data.features || '').trim(),
        role: (data.role || '').trim(),
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [project, ...prev]);
      addActivity('project', 'Created project', project.title);
      addToast('Project created successfully.', 'success');
      setAddOpen(false);
    }
  };

  const deleteProject = () => {
    if (!deleteId) return;
    const project = projects.find((p) => p.id === deleteId);
    setProjects((prev) => prev.filter((p) => p.id !== deleteId));
    if (project) addActivity('project', 'Removed project', project.title);
    addToast('Project deleted.', 'info');
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top action */}
      <div className="flex justify-end">
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Filter / Search */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, description or technology..."
          className="input-field !pl-9.5 text-sm"
        />
      </div>

      {/* Project Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {filtered.map((project) => (
            <div key={project.id} className="card card-hover p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate" title={project.title}>
                    {project.title}
                  </h3>
                  {project.featured && (
                    <span className="badge bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] shrink-0 inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> Featured
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                  {project.description || 'No description provided.'}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(project.techStack || []).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100 dark:border-dark-300 mt-2">
                <button
                  type="button"
                  onClick={() => setViewProject(project)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                <button
                  type="button"
                  onClick={() => setEditProject(project)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(project.id)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs text-red-500 hover:text-red-600"
                  aria-label="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 ml-auto">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost !px-2 !py-1.5 text-xs text-gray-700 dark:text-gray-300"
                      title="GitHub Repository"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost !px-2 !py-1.5 text-xs text-brand-600 dark:text-brand-400"
                      title="Live Deployment"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects found"
          description={search ? `No projects matched "${search}".` : "Add your portfolio projects to showcase your full stack capabilities."}
          action={
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> New Project
            </button>
          }
        />
      )}

      {/* Project Detail Modal */}
      {viewProject && (
        <Modal open={!!viewProject} onClose={() => setViewProject(null)} title={viewProject.title} wide>
          <div className="space-y-4">
            {viewProject.featured && (
              <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                ⭐ Featured Project
              </span>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {viewProject.description}
            </p>

            {viewProject.problem && <DetailSection label="Problem Statement" value={viewProject.problem} />}
            {viewProject.solution && <DetailSection label="Solution & Implementation" value={viewProject.solution} />}
            {viewProject.architecture && <DetailSection label="System Architecture" value={viewProject.architecture} />}
            {viewProject.features && <DetailSection label="Key Features" value={viewProject.features} />}
            {viewProject.role && <DetailSection label="Role & Contribution" value={viewProject.role} />}

            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Technologies Used</p>
              <div className="flex flex-wrap gap-1.5">
                {viewProject.techStack.map((tech) => (
                  <span key={tech} className="badge bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-gray-100 dark:border-dark-300">
              {viewProject.githubUrl && (
                <a
                  href={viewProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm inline-flex items-center justify-center gap-2"
                >
                  <Github className="w-4 h-4" /> View GitHub Repo
                </a>
              )}
              {viewProject.liveUrl && (
                <a
                  href={viewProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Open Live Application
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Project Form Modal */}
      <ProjectFormModal
        open={addOpen || !!editProject}
        onClose={() => {
          setAddOpen(false);
          setEditProject(null);
        }}
        project={editProject}
        onSave={saveProject}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? It will also be removed from any tailored resumes."
      />
    </div>
  );
}

function DetailSection({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-dark-200/50 p-3 rounded-xl border border-gray-100 dark:border-dark-300">
        {value}
      </p>
    </div>
  );
}

function ProjectFormModal({
  open,
  onClose,
  project,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (data: Partial<Project>) => void;
}) {
  const [form, setForm] = useState<Partial<Project>>({});
  const [stackInput, setStackInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setForm({ ...project });
      setStackInput((project.techStack || []).join(', '));
    } else {
      setForm({ featured: false, techStack: [] });
      setStackInput('');
    }
    setError('');
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      setError('Please provide a project title.');
      return;
    }
    onSave({
      ...form,
      techStack: stackInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? 'Edit Project' : 'New Project'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="input-label">Project Title *</label>
          <input
            className="input-field"
            value={form.title || ''}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              setError('');
            }}
            placeholder="e.g. CogniOS Competency Tracker"
            required
          />
        </div>

        <div>
          <label className="input-label">Brief Description</label>
          <textarea
            className="input-field"
            rows={2}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="High-level overview of the application..."
          />
        </div>

        <div>
          <label className="input-label">Tech Stack (comma-separated)</label>
          <input
            className="input-field"
            value={stackInput}
            onChange={(e) => setStackInput(e.target.value)}
            placeholder="Java, Spring Boot, React, TypeScript, PostgreSQL"
          />
        </div>

        <div className="flex items-center gap-2.5 py-1">
          <input
            type="checkbox"
            id="featured"
            checked={form.featured || false}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
          />
          <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Featured Project (Highlight on dashboard & resume)
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="input-label">GitHub URL</label>
            <input
              type="url"
              className="input-field"
              value={form.githubUrl || ''}
              onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label className="input-label">Live Deployment URL</label>
            <input
              type="url"
              className="input-field"
              value={form.liveUrl || ''}
              onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="input-label">Problem Statement</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.problem || ''}
              onChange={(e) => setForm({ ...form, problem: e.target.value })}
              placeholder="What core challenge does this solve?"
            />
          </div>
          <div>
            <label className="input-label">Solution Architecture</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.solution || ''}
              onChange={(e) => setForm({ ...form, solution: e.target.value })}
              placeholder="How does the system achieve the solution?"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="input-label">Key Features</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.features || ''}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="Authentication, RESTful CRUD, Redis caching..."
            />
          </div>
          <div>
            <label className="input-label">Role & Responsibilities</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.role || ''}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Architected database schema, built Spring Boot APIs..."
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-100 dark:border-dark-300">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Cancel
          </button>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            {project ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
