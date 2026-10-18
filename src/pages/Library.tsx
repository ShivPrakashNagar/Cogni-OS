import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/App';
import type { LibraryItem, LibraryStatus, LibraryCategory } from '@/types';
import { generateId, cn, getStatusColor, formatDate } from '@/lib/utils';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { Plus, Search, Edit2, Trash2, ExternalLink, Eye, Library, Tag, BookOpen } from 'lucide-react';

const libraryStatuses: LibraryStatus[] = ['Queued', 'Reading', 'Finished'];
const libraryCategories: LibraryCategory[] = ['Books', 'Documentation', 'Technical Notes', 'Interview Q&A', 'Code Snippets', 'Architecture', 'AI Notes', 'Learning Notes'];

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
    if (searchParams.get('add') === 'true') { setAddOpen(true); setSearchParams({}); }
  }, [searchParams, setSearchParams]);

  const filtered = library.filter((item) => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (catFilter !== 'All' && item.category !== catFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    return true;
  });

  const saveItem = (data: Partial<LibraryItem>) => {
    const now = new Date().toISOString();
    if (editItem) {
      setLibrary((prev) => prev.map((item) => (item.id === editItem.id ? { ...item, ...data, updatedAt: now } : item)));
      addActivity('library', 'Updated', data.title || editItem.title);
      addToast('Library item updated.');
      setEditItem(null);
    } else {
      const item: LibraryItem = {
        id: generateId(), title: data.title || '', author: data.author || '',
        category: data.category || 'Technical Notes', status: data.status || 'Queued',
        resourceUrl: data.resourceUrl || '', tags: data.tags || [],
        takeawaysMarkdown: data.takeawaysMarkdown || '',
        importantConcepts: data.importantConcepts || '', codeSnippets: data.codeSnippets || '',
        interviewQuestions: data.interviewQuestions || '', personalNotes: data.personalNotes || '',
        createdAt: now, updatedAt: now,
      };
      setLibrary((prev) => [...prev, item]);
      addActivity('library', 'Added', item.title);
      addToast('Library item added.');
      setAddOpen(false);
    }
  };

  const deleteItem = () => {
    if (!deleteId) return;
    const item = library.find((l) => l.id === deleteId);
    setLibrary((prev) => prev.filter((l) => l.id !== deleteId));
    if (item) addActivity('library', 'Removed', item.title);
    addToast('Library item deleted.');
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Knowledge Library</h1>
          <p className="page-subtitle">Your second brain — books, notes, snippets, and interview prep.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary self-start">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or tag..." className="input-field !pl-10" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input-field !w-auto">
          <option value="All">All Categories</option>
          {libraryCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field !w-auto">
          <option value="All">All Status</option>
          {libraryStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Library Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="card card-hover p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <span className={cn('badge text-[10px]', getStatusColor(item.status))}>{item.status}</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">{item.title}</h3>
              {item.author && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">by {item.author}</p>}
              <span className="badge bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400 text-[10px] w-fit mb-3">{item.category}</span>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Updated {formatDate(item.updatedAt)}</p>

              <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-gray-50 dark:border-dark-300">
                <button onClick={() => setViewItem(item)} className="btn-ghost !px-2 !py-1.5 text-xs">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button onClick={() => setEditItem(item)} className="btn-ghost !px-2 !py-1.5 text-xs">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteId(item.id)} className="btn-ghost !px-2 !py-1.5 text-xs text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {item.resourceUrl && (
                  <a href={item.resourceUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-2 !py-1.5 text-xs ml-auto">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No items found" description="Build your knowledge library." action={<button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Item</button>} />
      )}

      {/* View/Detail Modal */}
      {viewItem && (
        <Modal open={!!viewItem} onClose={() => setViewItem(null)} title={viewItem.title} wide>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={cn('badge', getStatusColor(viewItem.status))}>{viewItem.status}</span>
              <span className="badge bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400">{viewItem.category}</span>
            </div>
            {viewItem.author && <p className="text-sm text-gray-500 dark:text-gray-400">Author: {viewItem.author}</p>}
            {viewItem.resourceUrl && (
              <a href={viewItem.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                {viewItem.resourceUrl} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {viewItem.takeawaysMarkdown && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Takeaways</h3>
                <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-xl text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                  {viewItem.takeawaysMarkdown}
                </div>
              </div>
            )}
            {viewItem.importantConcepts && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Important Concepts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{viewItem.importantConcepts}</p>
              </div>
            )}
            {viewItem.codeSnippets && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Code Snippets</h3>
                <pre className="p-4 bg-gray-900 dark:bg-dark-0 text-gray-100 rounded-xl text-sm overflow-x-auto font-mono">
                  {viewItem.codeSnippets}
                </pre>
              </div>
            )}
            {viewItem.interviewQuestions && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Interview Questions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{viewItem.interviewQuestions}</p>
              </div>
            )}
            {viewItem.personalNotes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Personal Notes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{viewItem.personalNotes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      <LibraryFormModal open={addOpen || !!editItem} onClose={() => { setAddOpen(false); setEditItem(null); }} item={editItem} onSave={saveItem} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={deleteItem} title="Delete Library Item" message="This will permanently remove this knowledge item." />
    </div>
  );
}

function LibraryFormModal({ open, onClose, item, onSave }: {
  open: boolean; onClose: () => void; item: LibraryItem | null; onSave: (data: Partial<LibraryItem>) => void;
}) {
  const [form, setForm] = useState<Partial<LibraryItem>>({});
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (item) { setForm({ ...item }); setTagsInput(item.tags.join(', ')); }
    else { setForm({ category: 'Technical Notes', status: 'Queued', tags: [] }); setTagsInput(''); }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) return;
    onSave({ ...form, tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean) });
  };

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Edit Item' : 'Add Knowledge Item'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Title *</label>
            <input className="input-field" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="input-label">Author</label>
            <input className="input-field" value={form.author || ''} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Category</label>
            <select className="input-field" value={form.category || 'Technical Notes'} onChange={(e) => setForm({ ...form, category: e.target.value as LibraryCategory })}>
              {libraryCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Status</label>
            <select className="input-field" value={form.status || 'Queued'} onChange={(e) => setForm({ ...form, status: e.target.value as LibraryStatus })}>
              {libraryStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="input-label">Resource URL</label>
          <input className="input-field" value={form.resourceUrl || ''} onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className="input-label">Tags (comma-separated)</label>
          <input className="input-field" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Java, Spring Boot, Interview" />
        </div>
        <div>
          <label className="input-label">Key Takeaways (Markdown)</label>
          <textarea className="input-field font-mono text-xs" rows={4} value={form.takeawaysMarkdown || ''} onChange={(e) => setForm({ ...form, takeawaysMarkdown: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Important Concepts</label>
          <textarea className="input-field" rows={2} value={form.importantConcepts || ''} onChange={(e) => setForm({ ...form, importantConcepts: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Code Snippets</label>
          <textarea className="input-field font-mono text-xs" rows={3} value={form.codeSnippets || ''} onChange={(e) => setForm({ ...form, codeSnippets: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Interview Questions</label>
          <textarea className="input-field" rows={2} value={form.interviewQuestions || ''} onChange={(e) => setForm({ ...form, interviewQuestions: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Personal Notes</label>
          <textarea className="input-field" rows={2} value={form.personalNotes || ''} onChange={(e) => setForm({ ...form, personalNotes: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{item ? 'Update' : 'Add Item'}</button>
        </div>
      </form>
    </Modal>
  );
}
