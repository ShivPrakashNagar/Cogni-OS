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
    if (searchParams.get('add') === 'true') {
      setAddOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filtered = courses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !(c.platform || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    return true;
  });

  const saveCourse = (data: Partial<Course>) => {
    const now = new Date().toISOString();
    if (editCourse) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editCourse.id ? { ...c, ...data, updatedAt: now } : c))
      );
      addActivity('course', 'Updated', data.title || editCourse.title);
      addToast('Course updated successfully.', 'success');
      setEditCourse(null);
    } else {
      const course: Course = {
        id: generateId(),
        title: (data.title || '').trim(),
        platform: (data.platform || '').trim(),
        instructor: (data.instructor || '').trim(),
        progressPercentage: Number(data.progressPercentage) || 0,
        status: data.status || 'Not Started',
        totalDuration: (data.totalDuration || '').trim(),
        completedDuration: (data.completedDuration || '').trim(),
        certificateUrl: (data.certificateUrl || '').trim(),
        courseUrl: (data.courseUrl || '').trim(),
        type: (data.type || '').trim(),
        lastStudied: '',
        createdAt: now,
        updatedAt: now,
      };
      setCourses((prev) => [course, ...prev]);
      addActivity('course', 'Enrolled in', course.title);
      addToast('Course added successfully.', 'success');
      setAddOpen(false);
    }
  };

  const updateProgress = (id: string, progress: number) => {
    const clamped = Math.min(100, Math.max(0, progress));
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const status: CourseStatus = clamped >= 100 ? 'Completed' : clamped > 0 ? 'In Progress' : 'Not Started';
        return {
          ...c,
          progressPercentage: clamped,
          status,
          lastStudied: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteCourse = () => {
    if (!deleteId) return;
    const course = courses.find((c) => c.id === deleteId);
    setCourses((prev) => prev.filter((c) => c.id !== deleteId));
    if (course) addActivity('course', 'Removed', course.title);
    addToast('Course deleted.', 'info');
    setDeleteId(null);
  };

  const statusIcon = (status: CourseStatus) => {
    switch (status) {
      case 'In Progress':
        return <Play className="w-3.5 h-3.5" />;
      case 'Completed':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Paused':
        return <Pause className="w-3.5 h-3.5" />;
      default:
        return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action */}
      <div className="flex justify-end">
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses or platforms..."
            className="input-field !pl-9.5 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:!w-auto text-xs sm:text-sm"
          aria-label="Filter status"
        >
          <option value="All">All Statuses</option>
          {courseStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Course Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {filtered.map((course) => (
            <div key={course.id} className="card card-hover p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate" title={course.title}>
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{course.platform}</span>
                      {course.instructor && (
                        <>
                          <span>·</span>
                          <span className="truncate">{course.instructor}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={cn('badge text-[10px] shrink-0 inline-flex items-center gap-1', getStatusColor(course.status))}>
                    {statusIcon(course.status)}
                    <span>{course.status}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Completion</span>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{course.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-dark-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full progress-animate"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Duration info */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {course.totalDuration && <span>Total: {course.totalDuration}</span>}
                  {course.completedDuration && <span>Done: {course.completedDuration}</span>}
                  {course.lastStudied && <span>Last: {formatDate(course.lastStudied)}</span>}
                </div>

                {/* Interactive progress slider */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                    <span>Adjust Progress</span>
                    <span>{course.progressPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={course.progressPercentage}
                    onChange={(e) => updateProgress(course.id, Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-dark-400 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    aria-label={`Update progress for ${course.title}`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-dark-300">
                <button
                  onClick={() => setEditCourse(course)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(course.id)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs text-red-500 hover:text-red-600"
                  aria-label="Delete course"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5 ml-auto">
                  {course.courseUrl && (
                    <a
                      href={course.courseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost !px-2 !py-1.5 text-xs text-brand-600 dark:text-brand-400"
                      title="Open course"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Course
                    </a>
                  )}
                  {course.certificateUrl && (
                    <a
                      href={course.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost !px-2 !py-1.5 text-xs text-emerald-600 dark:text-emerald-400"
                      title="View certificate"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Cert
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No courses found"
          description={search ? `No courses match "${search}". Try adjusting your filters.` : "Start tracking your online courses and certifications."}
          action={
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Course
            </button>
          }
        />
      )}

      {/* Form modal */}
      <CourseFormModal
        open={addOpen || !!editCourse}
        onClose={() => {
          setAddOpen(false);
          setEditCourse(null);
        }}
        course={editCourse}
        onSave={saveCourse}
      />

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteCourse}
        title="Delete Course"
        message="Are you sure you want to delete this course from your learning tracker?"
      />
    </div>
  );
}

function CourseFormModal({
  open,
  onClose,
  course,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  onSave: (data: Partial<Course>) => void;
}) {
  const [form, setForm] = useState<Partial<Course>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      setForm({ ...course });
    } else {
      setForm({ status: 'Not Started', progressPercentage: 0 });
    }
    setError('');
  }, [course, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      setError('Please provide a course title.');
      return;
    }
    onSave(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={course ? 'Edit Course' : 'Add Course'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="input-label">Course Title *</label>
            <input
              className="input-field"
              value={form.title || ''}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                setError('');
              }}
              placeholder="e.g. Master Spring Boot 3 & Spring 6"
              required
            />
          </div>
          <div>
            <label className="input-label">Platform</label>
            <input
              className="input-field"
              value={form.platform || ''}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              placeholder="e.g. Udemy, Coursera"
            />
          </div>
          <div>
            <label className="input-label">Instructor</label>
            <input
              className="input-field"
              value={form.instructor || ''}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })}
              placeholder="e.g. in28minutes, Chad Darby"
            />
          </div>
          <div>
            <label className="input-label">Type / Category</label>
            <input
              className="input-field"
              value={form.type || ''}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              placeholder="e.g. Full Stack, Backend"
            />
          </div>
          <div>
            <label className="input-label">Total Duration</label>
            <input
              className="input-field"
              value={form.totalDuration || ''}
              onChange={(e) => setForm({ ...form, totalDuration: e.target.value })}
              placeholder="e.g. 42 hours"
            />
          </div>
          <div>
            <label className="input-label">Completed Duration</label>
            <input
              className="input-field"
              value={form.completedDuration || ''}
              onChange={(e) => setForm({ ...form, completedDuration: e.target.value })}
              placeholder="e.g. 27 hours"
            />
          </div>
          <div>
            <label className="input-label">Progress ({form.progressPercentage || 0}%)</label>
            <input
              type="number"
              className="input-field"
              value={form.progressPercentage ?? 0}
              onChange={(e) => setForm({ ...form, progressPercentage: Math.min(100, Math.max(0, Number(e.target.value))) })}
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className="input-label">Status</label>
            <select
              className="input-field"
              value={form.status || 'Not Started'}
              onChange={(e) => setForm({ ...form, status: e.target.value as CourseStatus })}
            >
              {courseStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="input-label">Course URL</label>
            <input
              type="url"
              className="input-field"
              value={form.courseUrl || ''}
              onChange={(e) => setForm({ ...form, courseUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="input-label">Certificate URL</label>
            <input
              type="url"
              className="input-field"
              value={form.certificateUrl || ''}
              onChange={(e) => setForm({ ...form, certificateUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-100 dark:border-dark-300">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Cancel
          </button>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            {course ? 'Update Course' : 'Add Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
