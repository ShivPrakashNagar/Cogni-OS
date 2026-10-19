import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/App';
import type { ResumeProfile } from '@/types';
import { generateId, cn } from '@/lib/utils';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Plus, FileText, Edit2, Trash2, Eye, Printer, Copy, CheckCircle2 } from 'lucide-react';

export default function Resume() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { resumes, setResumes, skills, projects, courses, academics, profile, addActivity, addToast } = useApp();

  const [addOpen, setAddOpen] = useState(false);
  const [editResume, setEditResume] = useState<ResumeProfile | null>(null);
  const [previewResume, setPreviewResume] = useState<ResumeProfile | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('add') === 'true') { setAddOpen(true); setSearchParams({}); }
  }, [searchParams, setSearchParams]);

  const saveResume = (data: Partial<ResumeProfile>) => {
    const now = new Date().toISOString();
    if (editResume) {
      setResumes((prev) => prev.map((r) => (r.id === editResume.id ? { ...r, ...data, updatedAt: now } : r)));
      addActivity('resume', 'Updated', data.roleTitle || editResume.roleTitle);
      addToast('Resume profile updated.');
      setEditResume(null);
    } else {
      const res: ResumeProfile = {
        id: generateId(), 
        roleTitle: data.roleTitle || '', 
        targetSummary: data.targetSummary || '',
        selectedSkillIds: data.selectedSkillIds || [], 
        selectedProjectIds: data.selectedProjectIds || [],
        selectedCourseIds: data.selectedCourseIds || [], 
        selectedSubjectIds: data.selectedSubjectIds || [],
        createdAt: now, updatedAt: now,
      };
      setResumes((prev) => [...prev, res]);
      addActivity('resume', 'Created', res.roleTitle);
      addToast('Resume profile created.');
      setAddOpen(false);
    }
  };

  const deleteResume = () => {
    if (!deleteId) return;
    const res = resumes.find((r) => r.id === deleteId);
    setResumes((prev) => prev.filter((r) => r.id !== deleteId));
    if (res) addActivity('resume', 'Deleted', res.roleTitle);
    addToast('Resume profile deleted.');
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Profile
        </button>
      </div>

      {/* Resume Profiles */}
      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 print:hidden">
          {resumes.map((resume) => {
            const selSkills = skills.filter((s) => resume.selectedSkillIds.includes(s.id));
            const selProjects = projects.filter((p) => resume.selectedProjectIds.includes(p.id));
            const selCourses = courses.filter((c) => resume.selectedCourseIds.includes(c.id));
            const selSubjects = academics.filter((a) => resume.selectedSubjectIds?.includes(a.id));
            return (
              <div key={resume.id} className="card card-hover p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">{resume.roleTitle}</h3>
                {resume.targetSummary && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{resume.targetSummary}</p>}

                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>{selSkills.length} skills</span>
                  <span>Â·</span>
                  <span>{selProjects.length} projects</span>
                  <span>Â·</span>
                  <span>{selCourses.length + (selSubjects?.length || 0)} edu items</span>
                </div>

                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-gray-50 dark:border-dark-300">
                  <button onClick={() => setPreviewResume(resume)} className="btn-ghost !px-2 !py-1.5 text-xs">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button onClick={() => setEditResume(resume)} className="btn-ghost !px-2 !py-1.5 text-xs">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteId(resume.id)} className="btn-ghost !px-2 !py-1.5 text-xs text-red-500 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="print:hidden">
          <EmptyState title="No resume profiles" description="Create your first role-specific ATS resume." action={<button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create Profile</button>} />
        </div>
      )}

      {/* Forms and Modals */}
      <ResumeFormModal
        open={addOpen || !!editResume}
        onClose={() => { setAddOpen(false); setEditResume(null); }}
        resume={editResume}
        onSave={saveResume}
        skills={skills}
        projects={projects}
        courses={courses}
        academics={academics}
      />

      {/* Print View Overlay */}
      {previewResume && (
        <div className="fixed inset-0 z-[100] bg-gray-200 dark:bg-dark-900 overflow-y-auto print:bg-white flex flex-col items-center py-8 print:p-0">
          <div className="flex items-center justify-between w-full max-w-[800px] mb-4 print:hidden px-4">
            <button onClick={() => setPreviewResume(null)} className="btn-secondary">Close Preview</button>
            <button onClick={() => window.print()} className="btn-primary"><Printer className="w-4 h-4" /> Print / Save as PDF</button>
          </div>
          
          {/* A4 Paper Container */}
          <div className="bg-white w-full max-w-[800px] min-h-[1130px] p-10 md:p-14 shadow-xl print:shadow-none print:w-full print:max-w-none print:p-0 font-sans text-gray-900">
            <ATSResume resume={previewResume} />
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={deleteResume} title="Delete Resume Profile" message="This will permanently delete this resume profile." />
    </div>
  );
}

// ============================================
// ATS Resume Printable Component
// ============================================
function ATSResume({ resume }: { resume: ResumeProfile }) {
  const { profile, skills, projects, courses, academics } = useApp();

  const selSkills = skills.filter((s) => resume.selectedSkillIds.includes(s.id));
  const selProjects = projects.filter((p) => resume.selectedProjectIds.includes(p.id));
  const selCourses = courses.filter((c) => resume.selectedCourseIds.includes(c.id));
  const selSubjects = academics.filter((a) => resume.selectedSubjectIds?.includes(a.id));

  // Group skills by category
  const groupedSkills: Record<string, string[]> = {};
  selSkills.forEach((s) => {
    if (!groupedSkills[s.category]) groupedSkills[s.category] = [];
    groupedSkills[s.category].push(s.name);
  });

  return (
    <div className="space-y-6 text-[11pt] leading-relaxed">
      {/* Header */}
      <div className="text-center border-b-[1.5px] border-gray-400 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.name || 'Your Name'}</h1>
        <p className="text-gray-700 font-medium">{resume.roleTitle}</p>
        <div className="text-[9pt] text-gray-600 mt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {profile.email && <span>{profile.email}</span>}
          {profile.phone && <span>â€¢ {profile.phone}</span>}
          {profile.linkedin && <span>â€¢ {profile.linkedin}</span>}
          {profile.github && <span>â€¢ {profile.github}</span>}
          {profile.portfolio && <span>â€¢ {profile.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {resume.targetSummary && (
        <div>
          <h2 className="text-[12pt] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
          <p className="text-gray-800">{resume.targetSummary}</p>
        </div>
      )}

      {/* Skills */}
      {Object.keys(groupedSkills).length > 0 && (
        <div>
          <h2 className="text-[12pt] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2">Technical Skills</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            {Object.entries(groupedSkills).map(([cat, items]) => (
              <li key={cat}>
                <span className="font-semibold">{cat}:</span> {items.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Projects */}
      {selProjects.length > 0 && (
        <div>
          <h2 className="text-[12pt] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2">Projects</h2>
          <div className="space-y-4">
            {selProjects.map((p) => (
              <div key={p.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-900 text-[11pt]">{p.title}</h3>
                  <div className="text-[9pt] text-gray-600">
                    {p.githubUrl && <a href={p.githubUrl} className="hover:underline">GitHub</a>}
                    {p.githubUrl && p.liveUrl && <span> | </span>}
                    {p.liveUrl && <a href={p.liveUrl} className="hover:underline">Live</a>}
                  </div>
                </div>
                {p.techStack && p.techStack.length > 0 && (
                  <p className="text-[10pt] text-gray-700 italic mb-1">Tech Stack: {p.techStack.join(', ')}</p>
                )}
                <p className="text-gray-800 whitespace-pre-wrap">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education / Courses */}
      {(selCourses.length > 0 || selSubjects.length > 0) && (
        <div>
          <h2 className="text-[12pt] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2">Education & Certifications</h2>
          <div className="space-y-2 text-gray-800">
            {selSubjects.map((s) => (
              <div key={s.id} className="flex justify-between">
                <span><span className="font-semibold">{s.subject}</span> (Semester {s.semester})</span>
                {s.grade && <span className="font-medium">Grade: {s.grade}</span>}
              </div>
            ))}
            {selCourses.map((c) => (
              <div key={c.id} className="flex justify-between">
                <span><span className="font-semibold">{c.title}</span> â€” {c.platform}</span>
                {c.courseUrl && <a href={c.courseUrl} className="text-[9pt] text-gray-600 hover:underline">Link</a>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================
// Resume Form with Selection UI
// ============================================
function ResumeFormModal({ open, onClose, resume, onSave, skills, projects, courses, academics }: {
  open: boolean; onClose: () => void; resume: ResumeProfile | null;
  onSave: (data: Partial<ResumeProfile>) => void;
  skills: any[]; projects: any[]; courses: any[]; academics: any[];
}) {
  const [form, setForm] = useState<Partial<ResumeProfile>>({});

  useEffect(() => {
    if (resume) setForm({ ...resume });
    else setForm({ selectedSkillIds: [], selectedProjectIds: [], selectedCourseIds: [], selectedSubjectIds: [] });
  }, [resume, open]);

  const toggleItem = (field: 'selectedSkillIds' | 'selectedProjectIds' | 'selectedCourseIds' | 'selectedSubjectIds', id: string) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      return { ...prev, [field]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={resume ? 'Edit Profile' : 'Create Profile'} wide>
      <form onSubmit={(e) => { e.preventDefault(); if (form.roleTitle?.trim()) onSave(form); }} className="space-y-5">
        <div>
          <label className="input-label">Target Role Title *</label>
          <input className="input-field" value={form.roleTitle || ''} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} required placeholder="e.g., Senior Full Stack Engineer" />
        </div>
        <div>
          <label className="input-label">Target Summary</label>
          <textarea className="input-field" rows={3} value={form.targetSummary || ''} onChange={(e) => setForm({ ...form, targetSummary: e.target.value })} />
        </div>

        {/* Skills Selection */}
        <div>
          <label className="input-label">Select Skills ({(form.selectedSkillIds || []).length} selected)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-300">
            {skills.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white dark:hover:bg-dark-300 px-2 py-1.5 rounded-lg transition-colors">
                <input type="checkbox" checked={(form.selectedSkillIds || []).includes(s.id)} onChange={() => toggleItem('selectedSkillIds', s.id)} className="w-3.5 h-3.5 rounded accent-brand-600" />
                <span className="text-gray-700 dark:text-gray-300 truncate">{s.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Projects Selection */}
        <div>
          <label className="input-label">Select Projects ({(form.selectedProjectIds || []).length} selected)</label>
          <div className="space-y-1 mt-2 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-300">
            {projects.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white dark:hover:bg-dark-300 px-2 py-1.5 rounded-lg transition-colors">
                <input type="checkbox" checked={(form.selectedProjectIds || []).includes(p.id)} onChange={() => toggleItem('selectedProjectIds', p.id)} className="w-3.5 h-3.5 rounded accent-brand-600" />
                <span className="text-gray-700 dark:text-gray-300">{p.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Courses Selection */}
          <div>
            <label className="input-label">Select Courses</label>
            <div className="space-y-1 mt-2 max-h-32 overflow-y-auto p-3 bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-300">
              {courses.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white dark:hover:bg-dark-300 px-2 py-1.5 rounded-lg transition-colors">
                  <input type="checkbox" checked={(form.selectedCourseIds || []).includes(c.id)} onChange={() => toggleItem('selectedCourseIds', c.id)} className="w-3.5 h-3.5 rounded accent-brand-600" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">{c.title}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Academics Selection */}
          <div>
            <label className="input-label">Select Subjects</label>
            <div className="space-y-1 mt-2 max-h-32 overflow-y-auto p-3 bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-300">
              {academics.map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white dark:hover:bg-dark-300 px-2 py-1.5 rounded-lg transition-colors">
                  <input type="checkbox" checked={(form.selectedSubjectIds || []).includes(a.id)} onChange={() => toggleItem('selectedSubjectIds', a.id)} className="w-3.5 h-3.5 rounded accent-brand-600" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">{a.subject}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{resume ? 'Update Profile' : 'Create Profile'}</button>
        </div>
      </form>
    </Modal>
  );
}

