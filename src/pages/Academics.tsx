import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/App';
import type { AcademicRecord, AcademicStatus } from '@/types';
import { generateId, cn, getStatusColor } from '@/lib/utils';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Plus, Search, Trash2, Edit2, GraduationCap, Calculator } from 'lucide-react';

const statuses: AcademicStatus[] = ['Completed', 'In Progress', 'Upcoming'];

import Courses from './Courses';
import { BookOpen } from 'lucide-react';

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

  const semesters = [...new Set(academics.map((a) => a.semester))].sort();

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

  // Study estimator
  const totalMins = questions * minsPerQ;
  const totalHours = (totalMins / 60).toFixed(1);
  const sessions = Math.ceil(totalMins / 45);

  const saveRecord = (data: Partial<AcademicRecord>) => {
    const now = new Date().toISOString();
    if (editRecord) {
      setAcademics((prev) => prev.map((a) => (a.id === editRecord.id ? { ...a, ...data, updatedAt: now } : a)));
      addToast('Record updated.');
      setEditRecord(null);
    } else {
      const rec: AcademicRecord = {
        id: generateId(), semester: data.semester || 1, subject: data.subject || '',
        credits: data.credits || 3, grade: data.grade || '', score: data.score || 0,
        status: data.status || 'In Progress', createdAt: now, updatedAt: now,
      };
      setAcademics((prev) => [...prev, rec]);
      addActivity('academic', 'Added', rec.subject);
      addToast('Subject added.');
      setAddOpen(false);
    }
  };

  const deleteRecord = () => {
    if (!deleteId) return;
    const rec = academics.find((a) => a.id === deleteId);
    setAcademics((prev) => prev.filter((a) => a.id !== deleteId));
    if (rec) addActivity('academic', 'Removed', rec.subject);
    addToast('Record deleted.');
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current CGPA</p>
          <p className="stat-number text-brand-600 dark:text-brand-400 mt-1">{cgpa}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semesters</p>
          <p className="stat-number text-gray-900 dark:text-gray-100 mt-1">{semesters.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subjects</p>
          <p className="stat-number text-gray-900 dark:text-gray-100 mt-1">{totalSubjects}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits Earned</p>
          <p className="stat-number text-gray-900 dark:text-gray-100 mt-1">{totalCreditsEarned}</p>
        </div>
      </div>

      {/* Semester Summary */}
      <div className="flex flex-wrap gap-3">
        {semesterSummaries.map((s) => (
          <div key={s.semester} className="card px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-brand-200 dark:hover:border-brand-800 transition-colors" onClick={() => setSemFilter(String(s.semester))}>
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Semester {s.semester}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.sgpa} SGPA · {s.subjects} subjects</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subjects..." className="input-field !pl-10" />
        </div>
        <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)} className="input-field !w-auto">
          <option value="All">All Semesters</option>
          {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field !w-auto">
          <option value="All">All Status</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-300">
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Semester</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Subject</th>
                  <th className="text-center px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Credits</th>
                  <th className="text-center px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Grade</th>
                  <th className="text-center px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Score</th>
                  <th className="text-center px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec) => (
                  <tr key={rec.id} className="border-b border-gray-50 dark:border-dark-300 last:border-0 hover:bg-gray-50/50 dark:hover:bg-dark-200/50 transition-colors">
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">Sem {rec.semester}</td>
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">{rec.subject}</td>
                    <td className="px-5 py-3 text-center text-gray-600 dark:text-gray-400">{rec.credits}</td>
                    <td className="px-5 py-3 text-center font-medium text-gray-800 dark:text-gray-200">{rec.grade || '—'}</td>
                    <td className="px-5 py-3 text-center text-gray-600 dark:text-gray-400">{rec.score > 0 ? rec.score : '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn('badge text-[10px]', getStatusColor(rec.status))}>{rec.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditRecord(rec)} className="btn-ghost !px-2 !py-1 text-xs"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(rec.id)} className="btn-ghost !px-2 !py-1 text-xs text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No records found" description="Add your academic records to track your progress." action={<button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Subject</button>} />
      )}

      {/* Study Load Estimator */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="section-title">Study Load Estimator</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="input-label">Number of Questions</label>
            <input type="number" className="input-field" value={questions} onChange={(e) => setQuestions(Number(e.target.value) || 0)} min={0} />
          </div>
          <div>
            <label className="input-label">Avg. Minutes/Question</label>
            <input type="number" className="input-field" value={minsPerQ} onChange={(e) => setMinsPerQ(Number(e.target.value) || 0)} min={0} />
          </div>
          <div className="card bg-brand-50 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800 p-4 flex flex-col justify-center">
            <p className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase">Total Time</p>
            <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">{totalMins} min</p>
            <p className="text-xs text-brand-600 dark:text-brand-400">≈ {totalHours} hours</p>
          </div>
          <div className="card bg-gray-50 dark:bg-dark-200 p-4 flex flex-col justify-center">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sessions (45min)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sessions}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">study sessions needed</p>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <AcademicFormModal open={addOpen || !!editRecord} onClose={() => { setAddOpen(false); setEditRecord(null); }} record={editRecord} onSave={saveRecord} semesters={semesters} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={deleteRecord} title="Delete Record" message="This will permanently remove this academic record." />
    </div>
  );
}

function AcademicFormModal({ open, onClose, record, onSave, semesters }: {
  open: boolean; onClose: () => void; record: AcademicRecord | null; onSave: (data: Partial<AcademicRecord>) => void; semesters: number[];
}) {
  const [form, setForm] = useState<Partial<AcademicRecord>>({});

  useEffect(() => {
    if (record) setForm({ ...record });
    else setForm({ semester: semesters.length > 0 ? Math.max(...semesters) : 1, credits: 3, status: 'In Progress', score: 0 });
  }, [record, open, semesters]);

  return (
    <Modal open={open} onClose={onClose} title={record ? 'Edit Subject' : 'Add Subject'}>
      <form onSubmit={(e) => { e.preventDefault(); if (form.subject?.trim()) onSave(form); }} className="space-y-4">
        <div>
          <label className="input-label">Subject Name *</label>
          <input className="input-field" value={form.subject || ''} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Semester</label>
            <input type="number" className="input-field" value={form.semester || 1} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} min={1} />
          </div>
          <div>
            <label className="input-label">Credits</label>
            <input type="number" className="input-field" value={form.credits || 3} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} min={1} />
          </div>
          <div>
            <label className="input-label">Grade</label>
            <input className="input-field" value={form.grade || ''} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="e.g., A+" />
          </div>
          <div>
            <label className="input-label">Score (out of 10)</label>
            <input type="number" className="input-field" value={form.score || 0} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} min={0} max={10} step={0.1} />
          </div>
        </div>
        <div>
          <label className="input-label">Status</label>
          <select className="input-field" value={form.status || 'In Progress'} onChange={(e) => setForm({ ...form, status: e.target.value as AcademicStatus })}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{record ? 'Update' : 'Add Subject'}</button>
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

      <div className="flex border-b border-gray-200 dark:border-dark-300">
        <button
          onClick={() => handleTabChange('academics')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors',
            activeTab === 'academics'
              ? 'border-brand-500 text-brand-700 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <GraduationCap className="w-4 h-4" />
          Formal Education
        </button>
        <button
          onClick={() => handleTabChange('courses')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors',
            activeTab === 'courses'
              ? 'border-brand-500 text-brand-700 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Online Courses
        </button>
      </div>

      <div className="pt-2">
        {activeTab === 'academics' ? <AcademicsTab /> : <Courses />}
      </div>
    </div>
  );
}
