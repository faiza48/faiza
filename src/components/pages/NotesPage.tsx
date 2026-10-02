import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Pin,
  Archive,
  Edit3,
  Trash2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import type { DailyraState, Note } from '../../types/dailyra';
import { Modal, ConfirmDialog, EmptyState } from '../ui/CommonUI';

interface NotesPageProps {
  state: DailyraState;
  darkMode: boolean;
  onCreateNote: (payload: Record<string, unknown>) => Promise<void>;
  onUpdateNote: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

const NOTE_CATEGORIES: Note['category'][] = [
  'Shopping List',
  'Ideas',
  'Work Notes',
  'Family Notes',
  'Personal Notes',
];

export const NotesPage: React.FC<NotesPageProps> = ({
  state,
  darkMode,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Archived' | Note['category']>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Note['category']>('Personal Notes');
  const [type, setType] = useState<'text' | 'checklist'>('text');
  const [content, setContent] = useState('');
  const [colorTone, setColorTone] = useState<Note['colorTone']>('cream');

  const openCreate = () => {
    setEditingNote(null);
    setTitle('');
    setCategory('Personal Notes');
    setType('text');
    setContent('');
    setColorTone('cream');
    setIsModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setCategory(note.category);
    setType(note.type);
    setContent(
      note.type === 'checklist'
        ? note.checklistItems.map((i) => i.text).join('\n')
        : note.content
    );
    setColorTone(note.colorTone);
    setIsModalOpen(true);
  };

  const filteredNotes = useMemo(() => {
    return state.notes
      .filter((n) => {
        if (selectedCategory === 'Archived') return n.archived;
        if (n.archived) return false;
        if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.checklistItems.some((c) => c.text.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [state.notes, selectedCategory, searchQuery]);

  const getToneStyle = (tone: Note['colorTone']) => {
    if (darkMode) return 'bg-[#18231D] border-[#28382E] text-[#EDF2EE]';
    switch (tone) {
      case 'sage':
        return 'bg-[#F2F6F1] border-[#DCE6DA]';
      case 'blush':
        return 'bg-[#FDF4F4] border-[#F0DFDF]';
      case 'sky':
        return 'bg-[#F2F7FB] border-[#DCE8F2]';
      case 'lavender':
        return 'bg-[#F5F3FB] border-[#E3DFF2]';
      default:
        return 'bg-[#FDFBF7] border-[#EAE4D7]';
    }
  };

  const inputClass = `w-full px-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-none ${
    darkMode
      ? 'bg-[#121B16] border-[#2C3E33] text-[#EDF2EE]'
      : 'bg-[#F8F6F1] border-[#E2DDD2] text-[#1F2421]'
  }`;

  return (
    <div className="px-4 sm:px-7 py-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Notes, Lists & Ideas
          </h1>
          <p className="text-xs text-[#6E7671] mt-1">
            Editorial paper-card modules for shopping lists, family memos, work notes, and personal reflections.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-[#234732] hover:bg-[#1B3727] text-white text-xs font-medium flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['All', ...NOTE_CATEGORIES, 'Archived'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#234732] text-white font-semibold'
                  : 'bg-[#F2EFE9] dark:bg-[#18231D] text-[#5A625D] dark:text-[#A9B8AF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#878F8A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes & checklists..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs bg-[#FDFCFB] dark:bg-[#18231D] border-[#E2DDD2] dark:border-[#28382E]"
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <EmptyState
          title="Capture an idea before it gets away."
          subtitle="Create a note, checklist, or shopping list to keep your thoughts organized."
          actionLabel="Create Note"
          onAction={openCreate}
          icon={<FileText className="w-5 h-5" />}
          darkMode={darkMode}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`${getToneStyle(
                note.colorTone
              )} rounded-2xl border p-5 flex flex-col justify-between shadow-[0_2px_10px_-4px_rgba(31,58,43,0.05)]`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-[#6E7671] font-medium">
                      {note.category}
                    </span>
                    <h3 className="font-serif-display text-2xl font-semibold mt-0.5">
                      {note.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateNote(note.id, { pinned: !note.pinned })
                    }
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      note.pinned
                        ? 'text-[#234732] bg-[#E4E9E1]'
                        : 'text-[#878F8A] hover:bg-black/5'
                    }`}
                    title={note.pinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>

                {note.type === 'checklist' ? (
                  <div className="mt-3.5 space-y-2">
                    {note.checklistItems.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2.5 text-xs cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => {
                            const updated = note.checklistItems.map((c) =>
                              c.id === item.id
                                ? { ...c, completed: !c.completed }
                                : c
                            );
                            onUpdateNote(note.id, { checklistItems: updated });
                          }}
                          className="w-4 h-4 rounded border-[#C5BFB3] text-[#234732]"
                        />
                        <span
                          className={
                            item.completed
                              ? 'line-through text-[#878F8A]'
                              : 'font-medium'
                          }
                        >
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs leading-relaxed text-[#49524C] dark:text-[#C4D1C9] whitespace-pre-line">
                    {note.content}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-5 border-t border-black/5 dark:border-white/10 text-[11px] text-[#7A827D]">
                <span>Updated {note.updatedAt.slice(0, 10)}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateNote(note.id, { archived: !note.archived })
                    }
                    className="p-1.5 rounded-lg hover:bg-black/5"
                    title={note.archived ? 'Restore note' : 'Archive note'}
                  >
                    {note.archived ? (
                      <RotateCcw className="w-3.5 h-3.5" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(note)}
                    className="p-1.5 rounded-lg hover:bg-black/5"
                    title="Edit note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingNoteId(note.id)}
                    className="p-1.5 rounded-lg hover:text-[#B84A4A]"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'Edit Note' : 'New Note'}
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const checklistItems =
              type === 'checklist'
                ? content
                    .split('\n')
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .map((text, idx) => ({
                      id: `ci-${Date.now()}-${idx}`,
                      text,
                      completed: false,
                    }))
                : [];
            const payload = {
              title,
              category,
              type,
              content,
              checklistItems,
              colorTone,
            };
            if (editingNote) {
              await onUpdateNote(editingNote.id, payload);
            } else {
              await onCreateNote({ ...payload, pinned: true });
            }
            setIsModalOpen(false);
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={inputClass}
              >
                {NOTE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Format</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className={inputClass}
              >
                <option value="text">Text Note</option>
                <option value="checklist">Checklist</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Paper Tone</label>
              <select
                value={colorTone}
                onChange={(e) => setColorTone(e.target.value as any)}
                className={inputClass}
              >
                {['cream', 'sage', 'blush', 'sky', 'lavender'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              {type === 'checklist' ? 'Items (one per line)' : 'Note Content'}
            </label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white"
            >
              Save Note
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingNoteId)}
        title="Delete this note?"
        message="This action cannot be undone."
        onConfirm={() => {
          if (deletingNoteId) onDeleteNote(deletingNoteId);
        }}
        onCancel={() => setDeletingNoteId(null)}
        darkMode={darkMode}
      />
    </div>
  );
};
