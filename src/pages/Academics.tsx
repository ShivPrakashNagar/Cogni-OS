import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/App';
import type { AcademicRecord, AcademicStatus } from '@/types';
import { generateId, cn, getStatusColor } from '@/lib/utils';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Plus, Search, Trash2, Edit2, GraduationCap, Calculator, BookOpen } from 'lucide-react';
import Courses from './Courses';

const statuses: AcademicStatus[] = ['Completed', 'In Progress', 'Upcoming'];

function AcademicsTab() {
  const { academics, setAcademics, addActivity, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [semFilter, setSemFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AcademicRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Study estimator
  const [questions, setQuestions] = useState(234);
  const [minsPerQ, setMinsPerQ] = useState(3);

  const semesters = [...new Set(academics.map((a) => a.semester))].sort((a, b) => a - b);

  const filtered = academics.filter((a) => {
    if (search && !a.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (semFilter !== 'All' && a.semester !== Number(semFilter)) return false;
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    return true;
  });

  // Semester summaries
  const semesterSummaries = semesters.map((sem) => {
    const records = academics.filter((a) => a.semester === sem && a.status === 'Completed' && a.score > 0);
    const totalCredits = records.reduce((s, r) => s + r.credits, 0);
    const weighted = records.reduce((s, r) => s + r.score * r.credits, 0);
    const sgpa = totalCredits > 0 ? (weighted / totalCredits).toFixed(1) : '-';
    return { semester: sem, sgpa, subjects: academics.filter((a) => a.semester === sem).length };
  });

  // Overall CGPA
  const completedAll = academics.filter((a) => a.status === 'Completed' && a.score > 0);
  const totalCreditsAll = completedAll.reduce((s, r) => s + r.credits, 0);
  const weightedAll = completedAll.reduce((s, r) => s + r.score * r.credits, 0);
  const cgpa = totalCreditsAll > 0 ? (weightedAll / totalCreditsAll).toFixed(2) : '0.00';
  const totalSubjects = academics.length;
  const totalCreditsEarned = completedAll.reduce((s, r) => s + r.credits, 0);

  // Study estimator calculations
  const totalMins = Math.max(0, questions) * Math.max(0, minsPerQ);
  const totalHours = (totalMins / 60).toFixed(1);
  const sessions = Math.ceil(totalMins / 45);

  const saveRecord = (data: Partial<AcademicRecord>) => {
    const now = new Date().toISOString();
    if (editRecord) {
      setAcademics((prev) =>
        prev.map((a) => (a.id === editRecord.id ? { ...a, ...data, updatedAt: now } : a))
      );
      addToast('Academic record updated.', 'success');
      setEditRecord(null);
    } else {
      const rec: AcademicRecord = {
        id: generateId(),
        semester: Number(data.semester) || 1,
        subject: (data.subject || '').trim(),
        credits: Number(data.credits) || 3,
        grade: (data.grade || '').trim().toUpperCase(),
        score: Number(data.score) || 0,
        status: data.status || 'In Progress',
        createdAt: now,
        updatedAt: now,
      };
      setAcademics((prev) => [...prev, rec]);
      addActivity('academic', 'Added subject', rec.subject);
      addToast('Subject added.', 'success');
      setAddOpen(false);
    }
  };

  const deleteRecord = () => {
    if (!deleteId) return;
    const rec = academics.find((a) => a.id === deleteId);
    setAcademics((prev) => prev.filter((a) => a.id !== deleteId));
    if (rec) addActivity('academic', 'Removed subject', rec.subject);
    addToast('Record deleted.', 'info');
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
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-3.5 sm:p-4">
          <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current CGPA</p>
          <p className="stat-number text-brand-600 dark:text-brand-400 mt-1">{cgpa}</p>
        </div>
        <div className="card p-3.5 sm:p-4">
          <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semesters</p>
          <p className="stat-number text-gray-900 dark:text-gray-100 mt-1">{semesters.length}</p>
        </div>
        <div className="card p-3.5 sm:p-4">
          <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Subjects</p>
          <p className="stat-number text-gray-900 dark:text-gray-100 mt-1">{totalSubjects}</p>
        </div>
        <div className="card p-3.5 sm:p-4">
          <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits Earned</p>
          <p className="stat-number text-gray-900 dark:text-gray-100 mt-1">{totalCreditsEarned}</p>
        </div>
      </div>

      {/* Semester Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSemFilter('All')}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0',
            semFilter === 'All'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-dark-100 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-300 hover:bg-gray-50'
          )}
        >
          All Semesters
        </button>
        {semesterSummaries.map((s) => (
          <button
            key={s.semester}
            onClick={() => setSemFilter(String(s.semester))}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 border',
              semFilter === String(s.semester)
                ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300 font-semibold'
                : 'bg-white dark:bg-dark-100 border-gray-200 dark:border-dark-300 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            )}
          >
            <span>Sem {s.semester}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-dark-200 text-gray-500">
              SGPA: {s.sgpa}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="input-field !pl-9.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
            className="input-field flex-1 sm:!w-auto text-xs sm:text-sm"
            aria-label="Filter semester"
          >
            <option value="All">All Semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field flex-1 sm:!w-auto text-xs sm:text-sm"
            aria-label="Filter status"
          >
            <option value="All">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Academic Table & Mobile Cards */}
      {filtered.length > 0 ? (
        <>
          {/* Mobile Card View (Small Screens) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((rec) => (
              <div key={rec.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="badge bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400 text-[10px] mb-1">
                      Semester {rec.semester} · {rec.credits} Credits
                    </span>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{rec.subject}</h3>
                  </div>
                  <span className={cn('badge text-[10px] shrink-0', getStatusColor(rec.status))}>
                    {rec.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-300 text-xs">
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <span>Grade: <strong className="text-gray-900 dark:text-gray-100">{rec.grade || '—'}</strong></span>
                    <span>Score: <strong className="text-gray-900 dark:text-gray-100">{rec.score > 0 ? rec.score : '—'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditRecord(rec)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-200"
                      aria-label="Edit subject"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(rec.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      aria-label="Delete subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-300 bg-gray-50/50 dark:bg-dark-200/50">
                    <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Semester</th>
                    <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Subject</th>
                    <th className="text-center px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Credits</th>
                    <th className="text-center px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Grade</th>
                    <th className="text-center px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Score</th>
                    <th className="text-center px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-300">
                  {filtered.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-200/40 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">Sem {rec.semester}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-gray-100">{rec.subject}</td>
                      <td className="px-5 py-3.5 text-center text-gray-600 dark:text-gray-400">{rec.credits}</td>
                      <td className="px-5 py-3.5 text-center font-medium text-gray-800 dark:text-gray-200">{rec.grade || '—'}</td>
                      <td className="px-5 py-3.5 text-center text-gray-600 dark:text-gray-400">{rec.score > 0 ? rec.score : '—'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={cn('badge text-[10px]', getStatusColor(rec.status))}>{rec.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditRecord(rec)}
                            className="btn-ghost !px-2 !py-1 text-xs"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(rec.id)}
                            className="btn-ghost !px-2 !py-1 text-xs text-red-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No records found"
          description="Add your academic records to track your semester performance and GPA."
          action={
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          }
        />
      )}

      {/* Study Load Estimator */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="section-title">Study Load Estimator</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Estimate study hours needed for upcoming exams</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="input-label">Number of Questions</label>
            <input
              type="number"
              className="input-field"
              value={questions}
              onChange={(e) => setQuestions(Math.max(0, Number(e.target.value)))}
              min={0}
            />
          </div>
          <div>
            <label className="input-label">Avg. Minutes/Question</label>
            <input
              type="number"
              className="input-field"
              value={minsPerQ}
              onChange={(e) => setMinsPerQ(Math.max(1, Number(e.target.value)))}
              min={1}
            />
          </div>
          <div className="card bg-brand-50/70 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800 p-4 flex flex-col justify-center">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider">Total Time</p>
            <p className="text-2xl font-bold text-brand-700 dark:text-brand-300 mt-0.5">{totalMins} min</p>
            <p className="text-xs text-brand-600 dark:text-brand-400">≈ {totalHours} hours total</p>
          </div>
          <div className="card bg-gray-50 dark:bg-dark-200 p-4 flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sessions (45m)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{sessions}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pomodoro blocks needed</p>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <AcademicFormModal
        open={addOpen || !!editRecord}
        onClose={() => {
          setAddOpen(false);
          setEditRecord(null);
        }}
        record={editRecord}
        onSave={saveRecord}
        semesters={semesters}
      />

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteRecord}
        title="Delete Record"
        message="This will permanently remove this academic record and recalculate your CGPA."
      />
    </div>
  );
}

function AcademicFormModal({
  open,
  onClose,
  record,
  onSave,
  semesters,
}: {
  open: boolean;
  onClose: () => void;
  record: AcademicRecord | null;
  onSave: (data: Partial<AcademicRecord>) => void;
  semesters: number[];
}) {
  const [form, setForm] = useState<Partial<AcademicRecord>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({ ...record });
    } else {
      setForm({
        semester: semesters.length > 0 ? Math.max(...semesters) : 1,
        credits: 3,
        status: 'In Progress',
        score: 0,
      });
    }
    setError('');
  }, [record, open, semesters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject?.trim()) {
      setError('Please provide a subject name.');
      return;
    }
    onSave(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={record ? 'Edit Subject' : 'Add Subject'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="input-label">Subject Name *</label>
          <input
            className="input-field"
            value={form.subject || ''}
            onChange={(e) => {
              setForm({ ...form, subject: e.target.value });
              setError('');
            }}
            placeholder="e.g. Data Structures & Algorithms"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="input-label">Semester</label>
            <input
              type="number"
              className="input-field"
              value={form.semester || 1}
              onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
              min={1}
              max={12}
            />
          </div>
          <div>
            <label className="input-label">Credits</label>
            <input
              type="number"
              className="input-field"
              value={form.credits ?? 3}
              onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
              min={1}
              max={20}
            />
          </div>
          <div>
            <label className="input-label">Grade</label>
            <input
              className="input-field"
              value={form.grade || ''}
              onChange={(e) => setForm({ ...form, grade: e.target.value.toUpperCase() })}
              placeholder="e.g., A+, O"
            />
          </div>
          <div>
            <label className="input-label">Score (0-10)</label>
            <input
              type="number"
              className="input-field"
              value={form.score ?? 0}
              onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              min={0}
              max={10}
              step={0.1}
            />
          </div>
        </div>

        <div>
          <label className="input-label">Status</label>
          <select
            className="input-field"
            value={form.status || 'In Progress'}
            onChange={(e) => setForm({ ...form, status: e.target.value as AcademicStatus })}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-100 dark:border-dark-300">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Cancel
          </button>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            {record ? 'Update Record' : 'Add Subject'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Academics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'academics' | 'courses'>('academics');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'courses') setActiveTab('courses');
    else if (tab === 'academics') setActiveTab('academics');
  }, [searchParams]);

  const handleTabChange = (tab: 'academics' | 'courses') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Academics & Courses</h1>
        <p className="page-subtitle">Track your formal education and continuous learning.</p>
      </div>

      <div className="flex border-b border-gray-200 dark:border-dark-300 gap-1 overflow-x-auto">
        <button
          onClick={() => handleTabChange('academics')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-medium transition-colors shrink-0',
            activeTab === 'academics'
              ? 'border-brand-500 text-brand-700 dark:text-brand-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <GraduationCap className="w-4 h-4" />
          Formal Education
        </button>
        <button
          onClick={() => handleTabChange('courses')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-medium transition-colors shrink-0',
            activeTab === 'courses'
              ? 'border-brand-500 text-brand-700 dark:text-brand-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Online Courses
        </button>
      </div>

      <div className="pt-1">
        {activeTab === 'academics' ? <AcademicsTab /> : <Courses />}
      </div>
    </div>
  );
}
