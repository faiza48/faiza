import React, { useState } from 'react';
import {
  Plus,
  Bell,
  AlarmClock,
  Repeat,
  Clock,
  Edit3,
  Trash2,
  BellRing,
} from 'lucide-react';
import type {
  DailyraState,
  Reminder,
  ReminderRepeat,
} from '../../types/dailyra';
import { Modal, ConfirmDialog, EmptyState } from '../ui/CommonUI';

interface RemindersPageProps {
  state: DailyraState;
  darkMode: boolean;
  onCreateReminder: (payload: Record<string, unknown>) => Promise<void>;
  onUpdateReminder: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({
  state,
  darkMode,
  onCreateReminder,
  onUpdateReminder,
  onDeleteReminder,
}) => {
  const [filterRepeat, setFilterRepeat] = useState<'All' | ReminderRepeat>('All');
  const [editingRem, setEditingRem] = useState<Reminder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingRemId, setDeletingRemId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [date, setDate] = useState('2025-10-12');
  const [repeat, setRepeat] = useState<ReminderRepeat>('Daily');
  const [category, setCategory] = useState<Reminder['category']>('Routine');
  const [familyMemberId, setFamilyMemberId] = useState('');
  const [notificationSetting, setNotificationSetting] = useState<Reminder['notificationSetting']>('Push & Sound');

  const openCreate = () => {
    setEditingRem(null);
    setTitle('');
    setTime('08:00 AM');
    setDate('2025-10-12');
    setRepeat('Daily');
    setCategory('Routine');
    setFamilyMemberId('');
    setNotificationSetting('Push & Sound');
    setIsModalOpen(true);
  };

  const openEdit = (rem: Reminder) => {
    setEditingRem(rem);
    setTitle(rem.title);
    setTime(rem.time);
    setDate(rem.date);
    setRepeat(rem.repeat);
    setCategory(rem.category);
    setFamilyMemberId(rem.familyMemberId || '');
    setNotificationSetting(rem.notificationSetting);
    setIsModalOpen(true);
  };

  const filtered = state.reminders.filter(
    (r) => filterRepeat === 'All' || r.repeat === filterRepeat
  );

  const cardSurface = darkMode
    ? 'bg-[#18231D] border-[#28382E] text-[#EDF2EE]'
    : 'bg-[#FDFCFB] border-[#EAE5DC] text-[#1F2421]';

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
            Reminders & Daily Alarms
          </h1>
          <p className="text-xs text-[#6E7671] mt-1">
            Gentle, dependable reminders for daily routines, medication, child pickups, and recurring bills.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-[#234732] hover:bg-[#1B3727] text-white text-xs font-medium flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['All', 'Daily', 'Weekly', 'Monthly', 'Yearly', 'One-time'] as const).map(
          (rep) => (
            <button
              key={rep}
              type="button"
              onClick={() => setFilterRepeat(rep)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterRepeat === rep
                  ? 'bg-[#234732] text-white font-semibold'
                  : 'bg-[#F2EFE9] dark:bg-[#18231D] text-[#5A625D] dark:text-[#A9B8AF]'
              }`}
            >
              {rep}
            </button>
          )
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No reminders in this view."
          subtitle="Create a daily alarm or recurring reminder to stay effortlessly on schedule."
          actionLabel="Add Reminder"
          onAction={openCreate}
          icon={<Bell className="w-5 h-5" />}
          darkMode={darkMode}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((rem) => {
            const linkedMember = state.familyMembers.find(
              (f) => f.id === rem.familyMemberId
            );
            return (
              <div
                key={rem.id}
                className={`${cardSurface} rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  !rem.enabled ? 'opacity-60' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          rem.enabled
                            ? 'bg-[#E4E9E1] text-[#234732]'
                            : 'bg-[#EFECE4] text-[#878F8A]'
                        }`}
                      >
                        <AlarmClock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xl font-bold tabular-nums leading-tight">
                          {rem.time}
                        </p>
                        <p className="text-[11px] text-[#7A827D] mt-0.5">
                          {rem.repeat} · {rem.category}
                        </p>
                      </div>
                    </div>

                    {/* Enable / Disable Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={rem.enabled}
                      onClick={() =>
                        onUpdateReminder(rem.id, { enabled: !rem.enabled })
                      }
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                        rem.enabled ? 'bg-[#234732]' : 'bg-[#D2CCC0] dark:bg-[#2F3E35]'
                      }`}
                      aria-label={`Toggle ${rem.title}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          rem.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="text-sm font-semibold mt-4">{rem.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#7A827D] mt-1.5">
                    <span className="flex items-center gap-1">
                      <BellRing className="w-3 h-3" />
                      {rem.notificationSetting}
                    </span>
                    {linkedMember && <span>· For {linkedMember.name}</span>}
                    {rem.snoozedUntil && (
                      <span className="text-[#B88228] font-medium">
                        · Snoozed ({rem.snoozedUntil})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#F0ECE3] dark:border-[#24332A]">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateReminder(rem.id, {
                        snoozedUntil: rem.snoozedUntil ? undefined : '+15 mins',
                      })
                    }
                    className="text-xs text-[#5A625D] hover:text-[#234732] font-medium flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{rem.snoozedUntil ? 'Clear Snooze' : 'Snooze 15m'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(rem)}
                      className="p-1.5 rounded-lg text-[#7A827D] hover:bg-[#F2EFE9]"
                      aria-label={`Edit ${rem.title}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingRemId(rem.id)}
                      className="p-1.5 rounded-lg text-[#7A827D] hover:text-[#B84A4A]"
                      aria-label={`Delete ${rem.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRem ? 'Edit Reminder' : 'Create Reminder'}
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = {
              title,
              time,
              date,
              repeat,
              category,
              familyMemberId: familyMemberId || undefined,
              notificationSetting,
              enabled: true,
            };
            if (editingRem) {
              await onUpdateReminder(editingRem.id, payload);
            } else {
              await onCreateReminder(payload);
            }
            setIsModalOpen(false);
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Reminder Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Repeat Cadence</label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as ReminderRepeat)}
                className={inputClass}
              >
                {(['Daily', 'Weekly', 'Monthly', 'Yearly', 'One-time', 'Custom'] as const).map(
                  (r) => (
                    <option key={r} value={r}>{r}</option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={inputClass}
              >
                {['Routine', 'Health', 'Family', 'Bills', 'Personal', 'Important Date'].map(
                  (c) => (
                    <option key={c} value={c}>{c}</option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Related Family Member</label>
              <select
                value={familyMemberId}
                onChange={(e) => setFamilyMemberId(e.target.value)}
                className={inputClass}
              >
                <option value="">None</option>
                {state.familyMembers.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Alert Style</label>
              <select
                value={notificationSetting}
                onChange={(e) => setNotificationSetting(e.target.value as any)}
                className={inputClass}
              >
                <option value="Push & Sound">Push & Sound</option>
                <option value="Banner Only">Banner Only</option>
                <option value="Silent Notification">Silent Notification</option>
              </select>
            </div>
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
              Save Reminder
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingRemId)}
        title="Delete this reminder?"
        message="This action cannot be undone."
        onConfirm={() => {
          if (deletingRemId) onDeleteReminder(deletingRemId);
        }}
        onCancel={() => setDeletingRemId(null)}
        darkMode={darkMode}
      />
    </div>
  );
};
