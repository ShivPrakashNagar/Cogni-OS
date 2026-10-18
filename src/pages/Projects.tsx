import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/App';
import type { Project } from '@/types';
import { generateId, cn } from '@/lib/utils';
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
    if (searchParams.get('add') === 'true') { setAddOpen(true); setSearchParams({}); }
  }, [searchParams, setSearchParams]);

  const filtered = projects.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const saveProject = (data: Partial<Project>) => {
    const now = new Date().toISOString();
    if (editProject) {
      setProjects((prev) => prev.map((p) => (p.id === editProject.id ? { ...p, ...data, updatedAt: now } : p)));
      addActivity('project', 'Updated', data.title || editProject.title);
      addToast('Project updated.');
      setEditProject(null);
    } else {
      const project: Project = {
        id: generateId(), title: data.title || '', description: data.description || '',
        techStack: data.techStack || [], githubUrl: data.githubUrl || '', liveUrl: data.liveUrl || '', 
        featured: data.featured || false, problem: data.problem || '', solution: data.solution || '', 
        architecture: data.architecture || '', features: data.features || '', role: data.role || '', 
        createdAt: now, updatedAt: now,
      };
      setProjects((prev) => [...prev, project]);
      addActivity('project', 'Created', project.title);
      addToast('Project created.');
      setAddOpen(false);
    }
  };

  const deleteProject = () => {
    if (!deleteId) return;
    const project = projects.find((p) => p.id === deleteId);
    setProjects((prev) => prev.filter((p) => p.id !== deleteId));
    if (project) addActivity('project', 'Removed', project.title);
    addToast('Project deleted.');
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects or tech..." className="input-field !pl-10" />
        </div>
      </div>

      {/* Project Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((project) => (
            <div key={project.id} className="card card-hover p-5 flex flex-col group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {project.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{project.title}</h3>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3 flex-1">{project.description}</p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.techStack.map((tech) => (
                  <span key={tech} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-gray-50 dark:border-dark-300">
                <button onClick={() => setViewProject(project)} className="btn-ghost !px-2 !py-1.5 text-xs">
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                <button onClick={() => setEditProject(project)} className="btn-ghost !px-2 !py-1.5 text-xs">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteId(project.id)} className="btn-ghost !px-2 !py-1.5 text-xs text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1 ml-auto">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-2 !py-1.5 text-xs">
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-2 !py-1.5 text-xs">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No projects found" description="Create your first project to build your portfolio." action={<button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Project</button>} />
      )}

      {/* Project Detail Modal */}
      {viewProject && (
        <Modal open={!!viewProject} onClose={() => setViewProject(null)} title={viewProject.title} wide>
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {viewProject.featured && <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">⭐ Featured</span>}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{viewProject.description}</p>
            {viewProject.problem && <DetailSection label="Problem" value={viewProject.problem} />}
            {viewProject.solution && <DetailSection label="Solution" value={viewProject.solution} />}
            {viewProject.architecture && <DetailSection label="Architecture" value={viewProject.architecture} />}
            {viewProject.features && <DetailSection label="Features" value={viewProject.features} />}
            {viewProject.role && <DetailSection label="Role & Responsibilities" value={viewProject.role} />}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {viewProject.techStack.map((tech) => (
                  <span key={tech} className="badge bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300">{tech}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              {viewProject.githubUrl && (
                <a href={viewProject.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              {viewProject.liveUrl && (
                <a href={viewProject.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                  <ExternalLink className="w-4 h-4" /> Live Demo
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}

      <ProjectFormModal open={addOpen || !!editProject} onClose={() => { setAddOpen(false); setEditProject(null); }} project={editProject} onSave={saveProject} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={deleteProject} title="Delete Project" message="This will permanently remove this project." />
    </div>
  );
}

function DetailSection({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function ProjectFormModal({ open, onClose, project, onSave }: {
  open: boolean; onClose: () => void; project: Project | null; onSave: (data: Partial<Project>) => void;
}) {
  const [form, setForm] = useState<Partial<Project>>({});
  const [stackInput, setStackInput] = useState('');

  useEffect(() => {
    if (project) { setForm({ ...project }); setStackInput(project.techStack.join(', ')); }
    else { setForm({ featured: false, techStack: [] }); setStackInput(''); }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;
    onSave({ ...form, techStack: stackInput.split(',').map((s) => s.trim()).filter(Boolean) });
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? 'Edit Project' : 'New Project'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Project Title *</label>
          <input className="input-field" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="input-label">Description</label>
          <textarea className="input-field" rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Tech Stack (comma-separated)</label>
          <input className="input-field" value={stackInput} onChange={(e) => setStackInput(e.target.value)} placeholder="Java, Spring Boot, React, PostgreSQL" />
        </div>
        <div className="flex items-center gap-2 pt-2 pb-2">
          <input type="checkbox" id="featured" checked={form.featured || false} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded accent-brand-600" />
          <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">Featured Project (Pin to top/highlight)</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">GitHub URL</label>
            <input className="input-field" value={form.githubUrl || ''} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Live URL</label>
            <input className="input-field" value={form.liveUrl || ''} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="input-label">Problem Statement</label>
          <textarea className="input-field" rows={2} value={form.problem || ''} onChange={(e) => setForm({ ...form, problem: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Solution</label>
          <textarea className="input-field" rows={2} value={form.solution || ''} onChange={(e) => setForm({ ...form, solution: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Features</label>
          <textarea className="input-field" rows={2} value={form.features || ''} onChange={(e) => setForm({ ...form, features: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Your Role</label>
          <textarea className="input-field" rows={2} value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{project ? 'Update' : 'Create Project'}</button>
        </div>
      </form>
    </Modal>
  );
}
