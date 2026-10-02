import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  CheckSquare,
  Coins,
  Users,
  Calendar,
  Bell,
  FileText,
  Folder,
  Heart,
  CalendarHeart,
  ArrowRight,
} from 'lucide-react';
import type { DailyraState, NavSection } from '../../types/dailyra';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: DailyraState;
  onNavigate: (section: NavSection) => void;
  darkMode: boolean;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  state,
  onNavigate,
  darkMode,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const family = state.familyMembers.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.relationship.toLowerCase().includes(q) ||
        f.schoolInfo.toLowerCase().includes(q) ||
        f.notes.toLowerCase().includes(q)
    );

    const tasks = state.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );

    const events = state.events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    );

    const transactions = state.transactions.filter(
      (tx) =>
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.notes.toLowerCase().includes(q) ||
        String(tx.amount).includes(q)
    );

    const notes = state.notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.checklistItems.some((c) => c.text.toLowerCase().includes(q))
    );

    const reminders = state.reminders.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );

    const documents = state.documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );

    const importantDates = state.importantDates.filter(
      (id) =>
        id.title.toLowerCase().includes(q) ||
        id.personOrEvent.toLowerCase().includes(q) ||
        id.type.toLowerCase().includes(q)
    );

    const health = state.healthRecords.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.personName.toLowerCase().includes(q) ||
        h.providerOrLocation.toLowerCase().includes(q)
    );

    const total =
      family.length +
      tasks.length +
      events.length +
      transactions.length +
      notes.length +
      reminders.length +
      documents.length +
      importantDates.length +
      health.length;

    return {
      total,
      family,
      tasks,
      events,
      transactions,
      notes,
      reminders,
      documents,
      importantDates,
      health,
    };
  }, [query, state]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${
          darkMode
            ? 'bg-[#18231D] border-[#2C3E33] text-[#EDF2EE]'
            : 'bg-[#FDFCFB] border-[#E5E0D5] text-[#1F2421]'
        }`}
      >
        {/* Top Search Bar */}
        <div
          className={`flex items-center gap-3 px-5 py-4 border-b ${
            darkMode ? 'border-[#293830]' : 'border-[#EDE9DF]'
          }`}
        >
          <Search className="w-5 h-5 text-[#234732] dark:text-[#8BD4A4] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across tasks, family, notes, transactions, calendar, documents..."
            className="w-full bg-transparent text-sm focus:outline-none placeholder-[#878F8A]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-[#7A827D] hover:text-[#1F2421] px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#7A827D] hover:bg-black/5"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search Suggestions when empty */}
        {!results ? (
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-[#7A827D] mb-2.5">
                Instant Life OS Search — Try searching for:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Emma', 'Electricity', 'Birthday', 'Grocery', 'Doctor', 'Passport', 'Milk'].map(
                  (sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setQuery(sample)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        darkMode
                          ? 'bg-[#213027] border-[#2F4438] text-[#D2E0D7] hover:bg-[#283A2F]'
                          : 'bg-[#F5F2EB] border-[#E5E0D5] text-[#3B443E] hover:bg-[#EAE5DC]'
                      }`}
                    >
                      “{sample}”
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ) : results.total === 0 ? (
          <div className="p-10 text-center">
            <p className="font-serif-display text-xl font-semibold">
              No matching records for “{query}”
            </p>
            <p className="text-xs text-[#7A827D] mt-1">
              Try searching for a family member name, task title, bill, or document.
            </p>
          </div>
        ) : (
          <div className="max-h-[65vh] overflow-y-auto p-4 space-y-4">
            {/* Family Results */}
            {results.family.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#7A827D] px-2 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#234732]" />
                  <span>Family ({results.family.length})</span>
                </p>
                <div className="space-y-1">
                  {results.family.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        onNavigate('family');
                        onClose();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F2EFE9] dark:hover:bg-[#223129] transition-colors"
                    >
                      <div>
                        <span className="text-xs font-semibold">Family → {f.name}</span>
                        <span className="text-xs text-[#7A827D] ml-2">
                          · {f.relationship} · {f.ageText}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#7A827D]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar Events */}
            {results.events.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#7A827D] px-2 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#234732]" />
                  <span>Calendar & Schedule ({results.events.length})</span>
                </p>
                <div className="space-y-1">
                  {results.events.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => {
                        onNavigate('calendar');
                        onClose();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F2EFE9] dark:hover:bg-[#223129] transition-colors"
                    >
                      <div>
                        <span className="text-xs font-semibold">Calendar → {ev.title}</span>
                        <span className="text-xs text-[#7A827D] ml-2">
                          · {ev.date} · {ev.startTime} · {ev.location}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#7A827D]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {results.tasks.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#7A827D] px-2 mb-1.5 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#234732]" />
                  <span>Tasks ({results.tasks.length})</span>
                </p>
                <div className="space-y-1">
                  {results.tasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onNavigate('tasks');
                        onClose();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F2EFE9] dark:hover:bg-[#223129] transition-colors"
                    >
                      <div>
                        <span className="text-xs font-semibold">Tasks → {t.title}</span>
                        <span className="text-xs text-[#7A827D] ml-2">
                          · {t.category} · {t.status}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#7A827D]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {results.notes.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#7A827D] px-2 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#234732]" />
                  <span>Notes ({results.notes.length})</span>
                </p>
                <div className="space-y-1">
                  {results.notes.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        onNavigate('notes');
                        onClose();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F2EFE9] dark:hover:bg-[#223129] transition-colors"
                    >
                      <div className="truncate pr-4">
                        <span className="text-xs font-semibold">Notes → {n.title}</span>
                        <span className="text-xs text-[#7A827D] ml-2">
                          · {n.category}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#7A827D] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Finance Transactions */}
            {results.transactions.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#7A827D] px-2 mb-1.5 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-[#234732]" />
                  <span>Finance Transactions ({results.transactions.length})</span>
                </p>
                <div className="space-y-1">
                  {results.transactions.map((tx) => (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => {
                        onNavigate('finance');
                        onClose();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F2EFE9] dark:hover:bg-[#223129] transition-colors"
                    >
                      <div>
                        <span className="text-xs font-semibold">
                          Finance → {tx.description}
                        </span>
                        <span className="text-xs text-[#7A827D] ml-2">
                          · {tx.category} · {tx.date}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          tx.type === 'income' ? 'text-[#267347]' : 'text-[#C44D4D]'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reminders, Important Dates, Documents, Health */}
            {(results.reminders.length > 0 ||
              results.importantDates.length > 0 ||
              results.documents.length > 0 ||
              results.health.length > 0) && (
              <div className="space-y-1 pt-1 border-t border-[#EDE9DF] dark:border-[#293830]">
                {results.importantDates.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      onNavigate('family');
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
                  >
                    <span className="text-xs font-semibold flex items-center gap-2">
                      <CalendarHeart className="w-3.5 h-3.5 text-[#234732]" />
                      Important Date → {d.title} ({d.date})
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7A827D]" />
                  </button>
                ))}
                {results.reminders.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      onNavigate('reminders');
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
                  >
                    <span className="text-xs font-semibold flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-[#234732]" />
                      Reminder → {r.title} ({r.time})
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7A827D]" />
                  </button>
                ))}
                {results.documents.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      onNavigate('documents');
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
                  >
                    <span className="text-xs font-semibold flex items-center gap-2">
                      <Folder className="w-3.5 h-3.5 text-[#234732]" />
                      Document → {doc.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7A827D]" />
                  </button>
                ))}
                {results.health.map((hr) => (
                  <button
                    key={hr.id}
                    type="button"
                    onClick={() => {
                      onNavigate('health');
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
                  >
                    <span className="text-xs font-semibold flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-[#234732]" />
                      Health → {hr.title} ({hr.personName})
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7A827D]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
