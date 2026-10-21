import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/App';
import type { ResumeProfile, Skill, Project, Course, AcademicSubject } from '@/types';
import { generateId } from '@/lib/utils';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Plus, FileText, Edit2, Trash2, Eye, Printer, Copy, CheckCircle2, X } from 'lucide-react';

export default function Resume() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { resumes, setResumes, skills, projects, courses, academics, profile, addActivity, addToast } = useApp();

  const [addOpen, setAddOpen] = useState(false);
  const [editResume, setEditResume] = useState<ResumeProfile | null>(null);
  const [previewResume, setPreviewResume] = useState<ResumeProfile | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setAddOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const saveResume = (data: Partial<ResumeProfile>) => {
    const now = new Date().toISOString();
    if (editResume) {
      setResumes((prev) =>
        prev.map((r) => (r.id === editResume.id ? { ...r, ...data, updatedAt: now } : r))
      );
      addActivity('resume', 'Updated profile', data.roleTitle || editResume.roleTitle);
      addToast('Resume profile updated successfully.', 'success');
      setEditResume(null);
    } else {
      const res: ResumeProfile = {
        id: generateId(),
        roleTitle: (data.roleTitle || '').trim(),
        targetSummary: (data.targetSummary || '').trim(),
        selectedSkillIds: data.selectedSkillIds || [],
        selectedProjectIds: data.selectedProjectIds || [],
        selectedCourseIds: data.selectedCourseIds || [],
        selectedSubjectIds: data.selectedSubjectIds || [],
        createdAt: now,
        updatedAt: now,
      };
      setResumes((prev) => [res, ...prev]);
      addActivity('resume', 'Created profile', res.roleTitle);
      addToast('Resume profile created.', 'success');
      setAddOpen(false);
    }
  };

  const deleteResume = () => {
    if (!deleteId) return;
    const res = resumes.find((r) => r.id === deleteId);
    setResumes((prev) => prev.filter((r) => r.id !== deleteId));
    if (res) addActivity('resume', 'Deleted profile', res.roleTitle);
    addToast('Resume profile deleted.', 'info');
    setDeleteId(null);
  };

  const copyAsPlainText = (resume: ResumeProfile) => {
    const selSkills = skills.filter((s) => (resume.selectedSkillIds || []).includes(s.id));
    const selProjects = projects.filter((p) => (resume.selectedProjectIds || []).includes(p.id));
    const selCourses = courses.filter((c) => (resume.selectedCourseIds || []).includes(c.id));
    const selSubjects = academics.filter((a) => (resume.selectedSubjectIds || []).includes(a.id));

    let text = `${profile.name || 'Shiv Dhakad'}\n${resume.roleTitle}\n`;
    const contact = [profile.email, profile.phone, profile.linkedin, profile.github].filter(Boolean);
    if (contact.length > 0) text += `${contact.join(' | ')}\n\n`;

    if (resume.targetSummary) {
      text += `PROFESSIONAL SUMMARY\n${resume.targetSummary}\n\n`;
    }

    if (selSkills.length > 0) {
      text += `TECHNICAL SKILLS\n`;
      const grouped: Record<string, string[]> = {};
      selSkills.forEach((s) => {
        if (!grouped[s.category]) grouped[s.category] = [];
        grouped[s.category].push(s.name);
      });
      for (const [cat, items] of Object.entries(grouped)) {
        text += `- ${cat}: ${items.join(', ')}\n`;
      }
      text += `\n`;
    }

    if (selProjects.length > 0) {
      text += `PROJECTS\n`;
      selProjects.forEach((p) => {
        text += `${p.title}${p.techStack?.length ? ` (${p.techStack.join(', ')})` : ''}\n`;
        if (p.description) text += `${p.description}\n`;
        if (p.githubUrl || p.liveUrl) text += `Links: ${[p.githubUrl, p.liveUrl].filter(Boolean).join(' | ')}\n`;
        text += `\n`;
      });
    }

    if (selSubjects.length > 0 || selCourses.length > 0) {
      text += `EDUCATION & CERTIFICATIONS\n`;
      selSubjects.forEach((s) => {
        text += `- ${s.subject} (Sem ${s.semester})${s.grade ? ` - Grade: ${s.grade}` : ''}\n`;
      });
      selCourses.forEach((c) => {
        text += `- ${c.title} — ${c.platform}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Resume copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Create Profile
        </button>
      </div>

      {/* Resume Profiles List */}
      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 print:hidden">
          {resumes.map((resume) => {
            const selSkills = skills.filter((s) => (resume.selectedSkillIds || []).includes(s.id));
            const selProjects = projects.filter((p) => (resume.selectedProjectIds || []).includes(p.id));
            const selCourses = courses.filter((c) => (resume.selectedCourseIds || []).includes(c.id));
            const selSubjects = academics.filter((a) => (resume.selectedSubjectIds || []).includes(a.id));

            return (
              <div key={resume.id} className="card card-hover p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate" title={resume.roleTitle}>
                    {resume.roleTitle}
                  </h3>
                  {resume.targetSummary && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {resume.targetSummary}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{selSkills.length} skills</span>
                    <span>·</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{selProjects.length} projects</span>
                    <span>·</span>
                    <span>{selCourses.length + selSubjects.length} edu items</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100 dark:border-dark-300 mt-2">
                  <button
                    type="button"
                    onClick={() => setPreviewResume(resume)}
                    className="btn-ghost !px-2.5 !py-1.5 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview & Print
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditResume(resume)}
                    className="btn-ghost !px-2.5 !py-1.5 text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(resume.id)}
                    className="btn-ghost !px-2.5 !py-1.5 text-xs text-red-500 hover:text-red-600"
                    aria-label="Delete profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="print:hidden">
          <EmptyState
            title="No resume profiles"
            description="Create your first role-specific ATS resume with customized skills, projects, and coursework."
            action={
              <button onClick={() => setAddOpen(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> Create Profile
              </button>
            }
          />
        </div>
      )}

      {/* Form Modal */}
      <ResumeFormModal
        open={addOpen || !!editResume}
        onClose={() => {
          setAddOpen(false);
          setEditResume(null);
        }}
        resume={editResume}
        onSave={saveResume}
        skills={skills}
        projects={projects}
        courses={courses}
        academics={academics}
      />

      {/* Fullscreen Preview Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-[100] bg-gray-900/70 backdrop-blur-xs overflow-y-auto print:bg-white flex flex-col items-center py-4 sm:py-8 print:p-0">
          <div className="flex flex-wrap items-center justify-between w-full max-w-[800px] mb-3 sm:mb-4 print:hidden px-3 gap-2">
            <button
              onClick={() => setPreviewResume(null)}
              className="btn-secondary !bg-white text-xs sm:text-sm"
            >
              <X className="w-4 h-4" /> Close Preview
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyAsPlainText(previewResume)}
                className="btn-secondary !bg-white text-xs sm:text-sm"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary text-xs sm:text-sm"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
            </div>
          </div>

          {/* Paper sheet */}
          <div className="bg-white w-full max-w-[800px] min-h-[1130px] p-5 sm:p-10 md:p-14 shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-0 font-sans text-gray-900 rounded-xl sm:rounded-none">
            <ATSResume resume={previewResume} />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteResume}
        title="Delete Resume Profile"
        message="This will permanently delete this resume profile."
      />
    </div>
  );
}

function ATSResume({ resume }: { resume: ResumeProfile }) {
  const { profile, skills, projects, courses, academics } = useApp();

  const selSkills = skills.filter((s) => (resume.selectedSkillIds || []).includes(s.id));
  const selProjects = projects.filter((p) => (resume.selectedProjectIds || []).includes(p.id));
  const selCourses = courses.filter((c) => (resume.selectedCourseIds || []).includes(c.id));
  const selSubjects = academics.filter((a) => (resume.selectedSubjectIds || []).includes(a.id));

  // Group skills by category
  const groupedSkills: Record<string, string[]> = {};
  selSkills.forEach((s) => {
    if (!groupedSkills[s.category]) groupedSkills[s.category] = [];
    groupedSkills[s.category].push(s.name);
  });

  return (
    <div className="space-y-5 text-[11pt] leading-relaxed">
      {/* Header */}
      <div className="text-center border-b-[1.5px] border-gray-400 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{profile.name || 'Shiv Dhakad'}</h1>
        <p className="text-gray-700 font-medium">{resume.roleTitle}</p>
        <div className="text-[9pt] text-gray-600 mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {profile.email && <span>{profile.email}</span>}
          {profile.phone && <span>• {profile.phone}</span>}
          {profile.linkedin && <span>• {profile.linkedin}</span>}
          {profile.github && <span>• {profile.github}</span>}
          {profile.portfolio && <span>• {profile.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {resume.targetSummary && (
        <div>
          <h2 className="text-[12pt] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-gray-800 text-justify">{resume.targetSummary}</p>
        </div>
      )}

      {/* Skills */}
      {Object.keys(groupedSkills).length > 0 && (
        <div>
          <h2 className="text-[12pt] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2">
            Technical Skills
          </h2>
          <ul className="space-y-1 text-gray-800">
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
          <h2 className="text-[12pt] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2">
            Projects
          </h2>
          <div className="space-y-4">
            {selProjects.map((p) => (
              <div key={p.id}>
                <div className="flex flex-wrap justify-between items-baseline gap-1">
                  <h3 className="font-bold text-gray-900 text-[11pt]">{p.title}</h3>
                  <div className="text-[9pt] text-gray-600">
                    {p.githubUrl && (
                      <a href={p.githubUrl} className="hover:underline text-brand-700" target="_blank" rel="noopener noreferrer">
                        GitHub
                      </a>
                    )}
                    {p.githubUrl && p.liveUrl && <span> | </span>}
                    {p.liveUrl && (
                      <a href={p.liveUrl} className="hover:underline text-brand-700" target="_blank" rel="noopener noreferrer">
                        Live Demo
                      </a>
                    )}
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
          <h2 className="text-[12pt] font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2">
            Education & Certifications
          </h2>
          <div className="space-y-2 text-gray-800">
            {selSubjects.map((s) => (
              <div key={s.id} className="flex justify-between items-center text-sm">
                <span>
                  <span className="font-semibold">{s.subject}</span> (Semester {s.semester})
                </span>
                {s.grade && <span className="font-medium">Grade: {s.grade}</span>}
              </div>
            ))}
            {selCourses.map((c) => (
              <div key={c.id} className="flex justify-between items-center text-sm">
                <span>
                  <span className="font-semibold">{c.title}</span> — {c.platform}
                </span>
                {c.courseUrl && (
                  <a href={c.courseUrl} className="text-[9pt] text-brand-700 hover:underline" target="_blank" rel="noopener noreferrer">
                    Verify
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResumeFormModal({
  open,
  onClose,
  resume,
  onSave,
  skills,
  projects,
  courses,
  academics,
}: {
  open: boolean;
  onClose: () => void;
  resume: ResumeProfile | null;
  onSave: (data: Partial<ResumeProfile>) => void;
  skills: Skill[];
  projects: Project[];
  courses: Course[];
  academics: AcademicSubject[];
}) {
  const [form, setForm] = useState<Partial<ResumeProfile>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (resume) {
      setForm({ ...resume });
    } else {
      setForm({
        selectedSkillIds: [],
        selectedProjectIds: [],
        selectedCourseIds: [],
        selectedSubjectIds: [],
      });
    }
    setError('');
  }, [resume, open]);

  const toggleItem = (
    field: 'selectedSkillIds' | 'selectedProjectIds' | 'selectedCourseIds' | 'selectedSubjectIds',
    id: string
  ) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      return { ...prev, [field]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roleTitle?.trim()) {
      setError('Please provide a target role title.');
      return;
    }
    onSave(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={resume ? 'Edit Profile' : 'Create Resume Profile'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="input-label">Target Role Title *</label>
          <input
            className="input-field"
            value={form.roleTitle || ''}
            onChange={(e) => {
              setForm({ ...form, roleTitle: e.target.value });
              setError('');
            }}
            required
            placeholder="e.g. Senior Java Full Stack Developer"
          />
        </div>

        <div>
          <label className="input-label">Professional Summary for this Role</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.targetSummary || ''}
            onChange={(e) => setForm({ ...form, targetSummary: e.target.value })}
            placeholder="Tailored summary highlighting your qualifications for this specific role..."
          />
        </div>

        {/* Skills Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="input-label mb-0">Select Skills</label>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
              {(form.selectedSkillIds || []).length} selected
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto p-3 bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-300">
            {skills.map((s) => {
              const isSelected = (form.selectedSkillIds || []).includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex items-center gap-2 text-xs cursor-pointer p-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 font-medium' : 'hover:bg-white dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItem('selectedSkillIds', s.id)}
                    className="w-3.5 h-3.5 rounded accent-brand-600"
                  />
                  <span className="truncate">{s.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Projects Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="input-label mb-0">Select Projects</label>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
              {(form.selectedProjectIds || []).length} selected
            </span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-300">
            {projects.map((p) => {
              const isSelected = (form.selectedProjectIds || []).includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-2 text-xs cursor-pointer p-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 font-medium' : 'hover:bg-white dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItem('selectedProjectIds', p.id)}
                    className="w-3.5 h-3.5 rounded accent-brand-600"
                  />
                  <span className="truncate">{p.title}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Courses Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="input-label mb-0">Select Courses</label>
              <span className="text-xs text-gray-400">
                {(form.selectedCourseIds || []).length}
              </span>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto p-2.5 bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-300">
              {courses.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white dark:hover:bg-dark-300 p-1.5 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={(form.selectedCourseIds || []).includes(c.id)}
                    onChange={() => toggleItem('selectedCourseIds', c.id)}
                    className="w-3.5 h-3.5 rounded accent-brand-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300 truncate">{c.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Academics Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="input-label mb-0">Select Coursework / Subjects</label>
              <span className="text-xs text-gray-400">
                {(form.selectedSubjectIds || []).length}
              </span>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto p-2.5 bg-gray-50 dark:bg-dark-200 rounded-xl border border-gray-100 dark:border-dark-300">
              {academics.map((a) => (
                <label
                  key={a.id}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white dark:hover:bg-dark-300 p-1.5 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={(form.selectedSubjectIds || []).includes(a.id)}
                    onChange={() => toggleItem('selectedSubjectIds', a.id)}
                    className="w-3.5 h-3.5 rounded accent-brand-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300 truncate">{a.subject}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-100 dark:border-dark-300">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Cancel
          </button>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            {resume ? 'Update Profile' : 'Save Resume Profile'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
