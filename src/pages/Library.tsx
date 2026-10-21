import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/App';
import type { LibraryItem, LibraryStatus, LibraryCategory } from '@/types';
import { generateId, cn, getStatusColor } from '@/lib/utils';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Plus, Search, Edit2, Trash2, ExternalLink, Eye, Library, Tag, Copy, CheckCircle2 } from 'lucide-react';

const libraryStatuses: LibraryStatus[] = ['Queued', 'Reading', 'Finished'];
const libraryCategories: LibraryCategory[] = [
  'Books',
  'Documentation',
  'Technical Notes',
  'Interview Q&A',
  'Code Snippets',
  'Architecture',
  'AI Notes',
  'Learning Notes',
];

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { library, setLibrary, addActivity, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<LibraryItem | null>(null);
  const [viewItem, setViewItem] = useState<LibraryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setAddOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filtered = library.filter((item) => {
    if (
      search &&
      !item.title.toLowerCase().includes(search.toLowerCase()) &&
      !(item.author || '').toLowerCase().includes(search.toLowerCase()) &&
      !(item.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    if (catFilter !== 'All' && item.category !== catFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    return true;
  });

  const saveItem = (data: Partial<LibraryItem>) => {
    const now = new Date().toISOString();
    if (editItem) {
      setLibrary((prev) =>
        prev.map((item) => (item.id === editItem.id ? { ...item, ...data, updatedAt: now } : item))
      );
      addActivity('library', 'Updated', data.title || editItem.title);
      addToast('Library item updated successfully.', 'success');
      setEditItem(null);
    } else {
      const item: LibraryItem = {
        id: generateId(),
        title: (data.title || '').trim(),
        author: (data.author || '').trim(),
        category: data.category || 'Technical Notes',
        status: data.status || 'Queued',
        resourceUrl: (data.resourceUrl || '').trim(),
        tags: data.tags || [],
        takeawaysMarkdown: data.takeawaysMarkdown || '',
        importantConcepts: data.importantConcepts || '',
        codeSnippets: data.codeSnippets || '',
        interviewQuestions: data.interviewQuestions || '',
        personalNotes: data.personalNotes || '',
        createdAt: now,
        updatedAt: now,
      };
      setLibrary((prev) => [item, ...prev]);
      addActivity('library', 'Added', item.title);
      addToast('Library item added successfully.', 'success');
      setAddOpen(false);
    }
  };

  const deleteItem = () => {
    if (!deleteId) return;
    const item = library.find((l) => l.id === deleteId);
    setLibrary((prev) => prev.filter((l) => l.id !== deleteId));
    if (item) addActivity('library', 'Removed', item.title);
    addToast('Item removed from library.', 'info');
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Technical Library</h1>
          <p className="page-subtitle">Your personal repository of engineering books, architecture notes, and interview prep.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary self-start sm:self-auto w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Item
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
            placeholder="Search titles, authors, tags..."
            className="input-field !pl-9.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="input-field flex-1 sm:!w-auto text-xs sm:text-sm"
            aria-label="Filter category"
          >
            <option value="All">All Categories</option>
            {libraryCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field flex-1 sm:!w-auto text-xs sm:text-sm"
            aria-label="Filter status"
          >
            <option value="All">All Statuses</option>
            {libraryStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Library Items Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="card card-hover p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="badge bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400 text-[10px]">
                    {item.category}
                  </span>
                  <span className={cn('badge text-[10px] shrink-0', getStatusColor(item.status))}>
                    {item.status}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1" title={item.title}>
                  {item.title}
                </h3>
                {item.author && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">by {item.author}</p>
                )}

                {item.importantConcepts && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {item.importantConcepts}
                  </p>
                )}

                {/* Tags */}
                {(item.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-gray-50 dark:bg-dark-200 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-dark-300"
                      >
                        <Tag className="w-2.5 h-2.5" /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100 dark:border-dark-300 mt-2">
                <button
                  type="button"
                  onClick={() => setViewItem(item)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" /> Read Notes
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(item)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(item.id)}
                  className="btn-ghost !px-2.5 !py-1.5 text-xs text-red-500 hover:text-red-600"
                  aria-label="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {item.resourceUrl && (
                  <a
                    href={item.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost !px-2.5 !py-1.5 text-xs ml-auto text-brand-600 dark:text-brand-400"
                    title="Open resource"
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
          title="No items found"
          description={search ? `No library resources match "${search}".` : "Add books, documentation guides, or interview cheat sheets."}
          action={
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          }
        />
      )}

      {/* View/Detail Modal */}
      {viewItem && (
        <ViewItemModal item={viewItem} onClose={() => setViewItem(null)} />
      )}

      {/* Form Modal */}
      <LibraryFormModal
        open={addOpen || !!editItem}
        onClose={() => {
          setAddOpen(false);
          setEditItem(null);
        }}
        item={editItem}
        onSave={saveItem}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteItem}
        title="Delete Library Item"
        message="This will permanently delete this knowledge record and its notes."
      />
    </div>
  );
}

function ViewItemModal({ item, onClose }: { item: LibraryItem; onClose: () => void }) {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const copyCode = () => {
    if (!item.codeSnippets) return;
    navigator.clipboard.writeText(item.codeSnippets);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <Modal open={true} onClose={onClose} title={item.title} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-gray-100 dark:border-dark-300">
          <span className={cn('badge', getStatusColor(item.status))}>{item.status}</span>
          <span className="badge bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300">
            {item.category}
          </span>
          {item.author && <span className="text-xs text-gray-500">by {item.author}</span>}
        </div>

        {item.resourceUrl && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Source URL</p>
            <a
              href={item.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1.5 break-all"
            >
              <span>{item.resourceUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        )}

        {item.takeawaysMarkdown && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Key Takeaways
            </p>
            <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed border border-gray-100 dark:border-dark-300">
              {item.takeawaysMarkdown}
            </div>
          </div>
        )}

        {item.importantConcepts && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Important Concepts
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-dark-200/50 p-3 rounded-xl border border-gray-100 dark:border-dark-300">
              {item.importantConcepts}
            </p>
          </div>
        )}

        {item.codeSnippets && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Code Snippets
              </p>
              <button
                type="button"
                onClick={copyCode}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                {copiedSnippet ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 sm:p-4 bg-gray-900 text-gray-100 rounded-xl text-xs overflow-x-auto font-mono leading-normal">
              {item.codeSnippets}
            </pre>
          </div>
        )}

        {item.interviewQuestions && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Interview Questions
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-dark-200/50 p-3 rounded-xl border border-gray-100 dark:border-dark-300">
              {item.interviewQuestions}
            </p>
          </div>
        )}

        {item.personalNotes && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Personal Notes
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-dark-200/50 p-3 rounded-xl border border-gray-100 dark:border-dark-300">
              {item.personalNotes}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-dark-300">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

function LibraryFormModal({
  open,
  onClose,
  item,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  item: LibraryItem | null;
  onSave: (data: Partial<LibraryItem>) => void;
}) {
  const [form, setForm] = useState<Partial<LibraryItem>>({});
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({ ...item });
      setTagsInput((item.tags || []).join(', '));
    } else {
      setForm({ category: 'Technical Notes', status: 'Queued', tags: [] });
      setTagsInput('');
    }
    setError('');
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      setError('Please provide a title.');
      return;
    }
    onSave({
      ...form,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Edit Knowledge Item' : 'Add Knowledge Item'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="input-label">Title *</label>
            <input
              className="input-field"
              value={form.title || ''}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                setError('');
              }}
              placeholder="e.g. Designing Data-Intensive Applications"
              required
            />
          </div>
          <div>
            <label className="input-label">Author / Creator</label>
            <input
              className="input-field"
              value={form.author || ''}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="e.g. Martin Kleppmann"
            />
          </div>
          <div>
            <label className="input-label">Category</label>
            <select
              className="input-field"
              value={form.category || 'Technical Notes'}
              onChange={(e) => setForm({ ...form, category: e.target.value as LibraryCategory })}
            >
              {libraryCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Reading Status</label>
            <select
              className="input-field"
              value={form.status || 'Queued'}
              onChange={(e) => setForm({ ...form, status: e.target.value as LibraryStatus })}
            >
              {libraryStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="input-label">Resource / Book URL</label>
          <input
            type="url"
            className="input-field"
            value={form.resourceUrl || ''}
            onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="input-label">Tags (comma-separated)</label>
          <input
            className="input-field"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Java, Distributed Systems, SQL"
          />
        </div>

        <div>
          <label className="input-label">Key Takeaways (Markdown / Notes)</label>
          <textarea
            className="input-field font-mono text-xs"
            rows={4}
            value={form.takeawaysMarkdown || ''}
            onChange={(e) => setForm({ ...form, takeawaysMarkdown: e.target.value })}
            placeholder="Main lessons, architectural insights..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="input-label">Important Concepts</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.importantConcepts || ''}
              onChange={(e) => setForm({ ...form, importantConcepts: e.target.value })}
              placeholder="Key definitions and principles..."
            />
          </div>
          <div>
            <label className="input-label">Interview Questions</label>
            <textarea
              className="input-field"
              rows={2}
              value={form.interviewQuestions || ''}
              onChange={(e) => setForm({ ...form, interviewQuestions: e.target.value })}
              placeholder="Frequently asked questions on this topic..."
            />
          </div>
        </div>

        <div>
          <label className="input-label">Code Snippets</label>
          <textarea
            className="input-field font-mono text-xs"
            rows={3}
            value={form.codeSnippets || ''}
            onChange={(e) => setForm({ ...form, codeSnippets: e.target.value })}
            placeholder="// Paste Java or SQL code snippets here"
          />
        </div>

        <div>
          <label className="input-label">Personal Reflection Notes</label>
          <textarea
            className="input-field"
            rows={2}
            value={form.personalNotes || ''}
            onChange={(e) => setForm({ ...form, personalNotes: e.target.value })}
            placeholder="Personal takeaways for your career..."
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-100 dark:border-dark-300">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
            Cancel
          </button>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            {item ? 'Update Record' : 'Save to Library'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
