import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/App';
import type { Course, CourseStatus } from '@/types';
import { generateId, cn, getStatusColor, formatDate } from '@/lib/utils';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Plus, Search, Edit2, Trash2, ExternalLink, BookOpen, Play, Pause, CheckCircle2 } from 'lucide-react';

const courseStatuses: CourseStatus[] = ['Not Started', 'In Progress', 'Completed', 'Paused'];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, setCourses, addActivity, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('add') === 'true') { setAddOpen(true); setSearchParams({}); }
  }, [searchParams, setSearchParams]);

  const filtered = courses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    return true;
  });

  const saveCourse = (data: Partial<Course>) => {
    const now = new Date().toISOString();
    if (editCourse) {
      setCourses((prev) => prev.map((c) => (c.id === editCourse.id ? { ...c, ...data, updatedAt: now } : c)));
      addActivity('course', 'Updated', data.title || editCourse.title);
      addToast('Course updated.');
      setEditCourse(null);
    } else {
      const course: Course = {
        id: generateId(), title: data.title || '', platform: data.platform || '',
        instructor: data.instructor || '', progressPercentage: data.progressPercentage || 0,
        status: data.status || 'Not Started', totalDuration: data.totalDuration || '',
        completedDuration: data.completedDuration || '', certificateUrl: data.certificateUrl || '',
        courseUrl: data.courseUrl || '',
        type: data.type || '', lastStudied: '', createdAt: now, updatedAt: now,
      };
      setCourses((prev) => [...prev, course]);
      addActivity('course', 'Added', course.title);
      addToast('Course added.');
      setAddOpen(false);
    }
  };

  const updateProgress = (id: string, progress: number) => {
    setCourses((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const status: CourseStatus = progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';
      return { ...c, progressPercentage: Math.min(100, Math.max(0, progress)), status, lastStudied: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }));
    const course = courses.find((c) => c.id === id);
    if (course) addActivity('course', `Updated progress to ${Math.min(100, progress)}%`, course.title);
  };

  const deleteCourse = () => {
    if (!deleteId) return;
    const course = courses.find((c) => c.id === deleteId);
    setCourses((prev) => prev.filter((c) => c.id !== deleteId));
    if (course) addActivity('course', 'Removed', course.title);
    addToast('Course deleted.');
    setDeleteId(null);
  };

  const statusIcon = (status: CourseStatus) => {
    switch (status) {
      case 'In Progress': return <Play className="w-3.5 h-3.5" />;
      case 'Completed': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Paused': return <Pause className="w-3.5 h-3.5" />;
      default: return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." className="input-field !pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field !w-auto">
          <option value="All">All Status</option>
          {courseStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Course Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <div key={course.id} className="card card-hover p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{course.platform}</span>
                    {course.instructor && (
                      <>
                        <span className="text-gray-300 dark:text-dark-500">·</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{course.instructor}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={cn('badge text-[10px] shrink-0 ml-2', getStatusColor(course.status))}>
                  {statusIcon(course.status)} {course.status}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Progress</span>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{course.progressPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-dark-300 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full progress-animate" style={{ width: `${course.progressPercentage}%` }} />
                </div>
              </div>

              {/* Duration info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                {course.totalDuration && <span>Total: {course.totalDuration}</span>}
                {course.completedDuration && <span>Done: {course.completedDuration}</span>}
                {course.lastStudied && <span>Last: {formatDate(course.lastStudied)}</span>}
              </div>

              {/* Progress slider */}
              <div className="mb-3">
                <input
                  type="range" min={0} max={100} value={course.progressPercentage}
                  onChange={(e) => updateProgress(course.id, Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-dark-400 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  aria-label={`Update progress for ${course.title}`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-gray-50 dark:border-dark-300">
                <button onClick={() => setEditCourse(course)} className="btn-ghost !px-2 !py-1.5 text-xs">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteId(course.id)} className="btn-ghost !px-2 !py-1.5 text-xs text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-2 ml-auto">
                  {course.courseUrl && (
                    <a href={course.courseUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-2 !py-1.5 text-xs">
                      <ExternalLink className="w-3.5 h-3.5" /> Link
                    </a>
                  )}
                  {course.certificateUrl && (
                    <a href={course.certificateUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-2 !py-1.5 text-xs">
                      <ExternalLink className="w-3.5 h-3.5" /> Certificate
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No courses found" description="Start tracking your learning journey." action={<button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Course</button>} />
      )}

      <CourseFormModal open={addOpen || !!editCourse} onClose={() => { setAddOpen(false); setEditCourse(null); }} course={editCourse} onSave={saveCourse} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={deleteCourse} title="Delete Course" message="This will permanently remove this course." />
    </div>
  );
}

function CourseFormModal({ open, onClose, course, onSave }: {
  open: boolean; onClose: () => void; course: Course | null; onSave: (data: Partial<Course>) => void;
}) {
  const [form, setForm] = useState<Partial<Course>>({});
  useEffect(() => {
    if (course) setForm({ ...course });
    else setForm({ status: 'Not Started', progressPercentage: 0 });
  }, [course, open]);

  return (
    <Modal open={open} onClose={onClose} title={course ? 'Edit Course' : 'Add Course'} wide>
      <form onSubmit={(e) => { e.preventDefault(); if (form.title?.trim()) onSave(form); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Course Title *</label>
            <input className="input-field" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="input-label">Platform</label>
            <input className="input-field" value={form.platform || ''} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="e.g., Udemy" />
          </div>
          <div>
            <label className="input-label">Instructor</label>
            <input className="input-field" value={form.instructor || ''} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Type</label>
            <input className="input-field" value={form.type || ''} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g., Full Stack" />
          </div>
          <div>
            <label className="input-label">Total Duration</label>
            <input className="input-field" value={form.totalDuration || ''} onChange={(e) => setForm({ ...form, totalDuration: e.target.value })} placeholder="e.g., 42 hours" />
          </div>
          <div>
            <label className="input-label">Completed Duration</label>
            <input className="input-field" value={form.completedDuration || ''} onChange={(e) => setForm({ ...form, completedDuration: e.target.value })} placeholder="e.g., 27 hours" />
          </div>
          <div>
            <label className="input-label">Progress (%)</label>
            <input type="number" className="input-field" value={form.progressPercentage || 0} onChange={(e) => setForm({ ...form, progressPercentage: Number(e.target.value) })} min={0} max={100} />
          </div>
          <div>
            <label className="input-label">Status</label>
            <select className="input-field" value={form.status || 'Not Started'} onChange={(e) => setForm({ ...form, status: e.target.value as CourseStatus })}>
              {courseStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Course URL</label>
            <input className="input-field" value={form.courseUrl || ''} onChange={(e) => setForm({ ...form, courseUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="input-label">Certificate URL</label>
            <input className="input-field" value={form.certificateUrl || ''} onChange={(e) => setForm({ ...form, certificateUrl: e.target.value })} placeholder="https://..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{course ? 'Update' : 'Add Course'}</button>
        </div>
      </form>
    </Modal>
  );
}
