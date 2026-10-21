import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/App';
import type { Skill, SkillCategory, ProficiencyLevel } from '@/types';
import { generateId, cn, getProficiencyColor, getCategoryColor } from '@/lib/utils';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Plus, Search, Edit2, Trash2, ExternalLink, Eye, Zap } from 'lucide-react';

const categories: SkillCategory[] = ['Backend', 'Frontend', 'Full Stack', 'Database/DevOps', 'AI'];
const proficiencies: ProficiencyLevel[] = ['Beginner', 'Intermediate', 'Mastered'];

export default function Skills() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { skills, setSkills, addActivity, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [profFilter, setProfFilter] = useState<string>('All');

  // Modal states
  const [editSkill, setEditSkill] = useState<Skill | null>(null);
  const [viewSkill, setViewSkill] = useState<Skill | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setAddOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filtered = skills.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== 'All' && s.category !== catFilter) return false;
    if (profFilter !== 'All' && s.proficiency !== profFilter) return false;
    return true;
  });

  const saveSkill = (data: Partial<Skill>) => {
    const now = new Date().toISOString();
    if (editSkill) {
      setSkills((prev) =>
        prev.map((s) => (s.id === editSkill.id ? { ...s, ...data, updatedAt: now } : s))
      );
      addActivity('skill', 'Updated', data.name || editSkill.name);
      addToast('Skill updated successfully.', 'success');
      setEditSkill(null);
    } else {
      const newSkill: Skill = {
        id: generateId(),
        name: (data.name || '').trim(),
        category: data.category || 'Backend',
        proficiency: data.proficiency || 'Beginner',
        playbook: data.playbook || { bestFor: '', tradeoffs: '', alternatives: '' },
        proofOfWorkUrl: (data.proofOfWorkUrl || '').trim(),
        learningNotes: (data.learningNotes || '').trim(),
        createdAt: now,
        updatedAt: now,
      };
      setSkills((prev) => [newSkill, ...prev]);
      addActivity('skill', 'Added', newSkill.name);
      addToast('Skill added successfully.', 'success');
      setAddOpen(false);
    }
  };

  const deleteSkill = () => {
    if (!deleteId) return;
    const skill = skills.find((s) => s.id === deleteId);
    setSkills((prev) => prev.filter((s) => s.id !== deleteId));
    if (skill) addActivity('skill', 'Removed', skill.name);
    addToast('Skill deleted.', 'info');
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Skills Playbook</h1>
          <p className="page-subtitle">Track your competencies and technical playbook.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="input-field !pl-9.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="input-field flex-1 sm:!w-auto text-xs sm:text-sm"
            aria-label="Filter by category"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={profFilter}
            onChange={(e) => setProfFilter(e.target.value)}
            className="input-field flex-1 sm:!w-auto text-xs sm:text-sm"
            aria-label="Filter by proficiency"
          >
            <option value="All">All Proficiencies</option>
            {proficiencies.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of skills */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {filtered.map((skill) => (
            <div key={skill.id} className="card card-hover p-4 sm:p-5 group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-50 dark:bg-dark-200 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {skill.name}
                      </h3>
                      <span className={cn('badge text-[10px] mt-1', getCategoryColor(skill.category))}>
                        {skill.category}
                      </span>
                    </div>
                  </div>
                  <span className={cn('badge text-[10px] shrink-0', getProficiencyColor(skill.proficiency))}>
                    {skill.proficiency}
                  </span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 my-3">
                  {skill.playbook.bestFor && (
                    <p className="line-clamp-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Best for: </span>
                      {skill.playbook.bestFor}
                    </p>
                  )}
                  {skill.playbook.tradeoffs && (
                    <p className="line-clamp-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Trade-offs: </span>
                      {skill.playbook.tradeoffs}
                    </p>
                  )}
                  {!skill.playbook.bestFor && !skill.playbook.tradeoffs && (
                    <p className="text-gray-400 italic">No playbook notes entered yet.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-2 pt-3 border-t border-gray-100 dark:border-dark-300">
                <button
                  type="button"
                  onClick={() => setViewSkill(skill)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button
                  type="button"
                  onClick={() => setEditSkill(skill)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(skill.id)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs text-red-500 hover:text-red-600 dark:text-red-400"
                  aria-label={`Delete ${skill.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {skill.proofOfWorkUrl && (
                  <a
                    href={skill.proofOfWorkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost !px-2.5 !py-1.5 text-xs ml-auto text-brand-600 dark:text-brand-400"
                    title="Open proof of work"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No skills found"
          description={search ? `No skills match "${search}". Try adjusting your search or filters.` : "Get started by adding your core technical skills."}
          action={
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          }
        />
      )}

      {/* Form modal */}
      <SkillFormModal
        open={addOpen || !!editSkill}
        onClose={() => {
          setAddOpen(false);
          setEditSkill(null);
        }}
        skill={editSkill}
        onSave={saveSkill}
      />

      {/* Detail modal */}
      <SkillDetailModal skill={viewSkill} onClose={() => setViewSkill(null)} />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteSkill}
        title="Delete Skill"
        message="Are you sure you want to delete this skill? It will also be removed from any linked resumes."
      />
    </div>
  );
}

function SkillFormModal({
  open,
  onClose,
  skill,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  skill: Skill | null;
  onSave: (data: Partial<Skill>) => void;
}) {
  const [form, setForm] = useState<Partial<Skill>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (skill) {
      setForm({ ...skill });
    } else {
      setForm({
        category: 'Backend',
        proficiency: 'Beginner',
        playbook: { bestFor: '', tradeoffs: '', alternatives: '' },
      });
    }
    setError('');
  }, [skill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      setError('Please provide a skill name.');
      return;
    }
    onSave(form);
  };

  const setPlaybook = (field: keyof Skill['playbook'], value: string) => {
    setForm((prev) => ({
      ...prev,
      playbook: { ...prev.playbook!, [field]: value },
    }));
  };

  return (
    <Modal open={open} onClose={onClose} title={skill ? 'Edit Skill' : 'Add Skill'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="input-label">Skill Name *</label>
            <input
              className="input-field"
              value={form.name || ''}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setError('');
              }}
              placeholder="e.g. Spring Boot"
              required
            />
          </div>
          <div>
            <label className="input-label">Category</label>
            <select
              className="input-field"
              value={form.category || 'Backend'}
              onChange={(e) => setForm({ ...form, category: e.target.value as SkillCategory })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Proficiency</label>
            <select
              className="input-field"
              value={form.proficiency || 'Beginner'}
              onChange={(e) => setForm({ ...form, proficiency: e.target.value as ProficiencyLevel })}
            >
              {proficiencies.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Proof of Work (URL)</label>
            <input
              type="url"
              className="input-field"
              value={form.proofOfWorkUrl || ''}
              onChange={(e) => setForm({ ...form, proofOfWorkUrl: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>
        </div>

        <div>
          <label className="input-label">Best For</label>
          <textarea
            className="input-field"
            rows={2}
            value={form.playbook?.bestFor || ''}
            onChange={(e) => setPlaybook('bestFor', e.target.value)}
            placeholder="When is this technology the optimal choice?"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="input-label">Trade-offs</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.playbook?.tradeoffs || ''}
              onChange={(e) => setPlaybook('tradeoffs', e.target.value)}
              placeholder="What are the weaknesses or drawbacks?"
            />
          </div>
          <div>
            <label className="input-label">Alternatives</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.playbook?.alternatives || ''}
              onChange={(e) => setPlaybook('alternatives', e.target.value)}
              placeholder="Comparable technologies (e.g., Node.js, Go)"
            />
          </div>
        </div>

        <div>
          <label className="input-label">Personal Learning Notes</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.learningNotes || ''}
            onChange={(e) => setForm({ ...form, learningNotes: e.target.value })}
            placeholder="Key concepts, commands, or personal gotchas..."
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-100 dark:border-dark-300">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Cancel
          </button>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            {skill ? 'Update Skill' : 'Add Skill'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SkillDetailModal({ skill, onClose }: { skill: Skill | null; onClose: () => void }) {
  if (!skill) return null;
  return (
    <Modal open={!!skill} onClose={onClose} title={skill.name} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-gray-100 dark:border-dark-300">
          <span className={cn('badge', getCategoryColor(skill.category))}>{skill.category}</span>
          <span className={cn('badge', getProficiencyColor(skill.proficiency))}>{skill.proficiency}</span>
        </div>

        {skill.playbook.bestFor && <Detail label="Best For" value={skill.playbook.bestFor} />}
        {skill.playbook.tradeoffs && <Detail label="Trade-offs" value={skill.playbook.tradeoffs} />}
        {skill.playbook.alternatives && <Detail label="Alternatives" value={skill.playbook.alternatives} />}
        {skill.learningNotes && <Detail label="Learning Notes" value={skill.learningNotes} />}

        {skill.proofOfWorkUrl && (
          <div className="pt-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Proof of Work</p>
            <a
              href={skill.proofOfWorkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1.5 break-all"
            >
              <span>{skill.proofOfWorkUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-dark-300">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-dark-200/50 p-3 rounded-xl border border-gray-100 dark:border-dark-300">
        {value}
      </p>
    </div>
  );
}
