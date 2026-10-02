import React, { useState, useMemo } from 'react';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Edit3,
  Trash2,
  Repeat,
  Bell,
} from 'lucide-react';
import type {
  DailyraState,
  CalendarEvent,
  EventCategory,
} from '../../types/dailyra';
import { Modal, ConfirmDialog } from '../ui/CommonUI';

interface CalendarPageProps {
  state: DailyraState;
  darkMode: boolean;
  onCreateEvent: (payload: Record<string, unknown>) => Promise<void>;
  onUpdateEvent: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  state,
  darkMode,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day' | 'Agenda'>('Month');
  const [selectedDate, setSelectedDate] = useState('2025-10-12');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2025-10-12');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [location, setLocation] = useState('Home');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Personal');
  const [reminder, setReminder] = useState('30 mins before');
  const [repeat, setRepeat] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('None');
  const [familyMemberId, setFamilyMemberId] = useState('');

  const openCreateModal = (defaultDate = selectedDate) => {
    setSelectedEvent(null);
    setTitle('');
    setDate(defaultDate);
    setStartTime('10:00 AM');
    setEndTime('11:00 AM');
    setLocation('Home');
    setDescription('');
    setCategory('Personal');
    setReminder('30 mins before');
    setRepeat('None');
    setFamilyMemberId('');
    setIsModalOpen(true);
  };

  const openEditModal = (ev: CalendarEvent) => {
    setSelectedEvent(ev);
    setTitle(ev.title);
    setDate(ev.date);
    setStartTime(ev.startTime);
    setEndTime(ev.endTime);
    setLocation(ev.location);
    setDescription(ev.description);
    setCategory(ev.category);
    setReminder(ev.reminder);
    setRepeat(ev.repeat);
    setFamilyMemberId(ev.familyMemberId || '');
    setIsModalOpen(true);
  };

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    state.events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [state.events]);

  const selectedDayEvents = useMemo(
    () => eventsByDate[selectedDate] || [],
    [eventsByDate, selectedDate]
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Calendar & Life Schedule
          </h1>
          <p className="text-xs text-[#6E7671] mt-1">
            Connected view of your daily schedule, family events, birthdays, and health appointments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher: Month, Week, Day, Agenda */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F2EFE9] dark:bg-[#131C17]">
            {(['Month', 'Week', 'Day', 'Agenda'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  viewMode === mode
                    ? 'bg-[#FDFCFB] dark:bg-[#23362B] text-[#1E3F2B] dark:text-white shadow-xs font-semibold'
                    : 'text-[#6E7671]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openCreateModal(selectedDate)}
            className="px-4 py-2 rounded-xl bg-[#234732] hover:bg-[#1B3727] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Calendar Canvas */}
        <div className={`${cardSurface} lg:col-span-8 rounded-2xl border p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif-display text-2xl font-semibold">
              October 2025
            </h2>
            <span className="text-xs text-[#7A827D] tabular-nums">
              Selected: {selectedDate}
            </span>
          </div>

          {viewMode === 'Month' && (
            <>
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#7A827D] pb-2 border-b border-[#EDE9DF] dark:border-[#28382E]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5 pt-2">
                {/* 3 empty cells for Oct 2025 starting Wednesday */}
                {[1, 2, 3].map((n) => (
                  <div key={`empty-${n}`} className="h-24 rounded-xl bg-transparent" />
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
                  const dateKey = `2025-10-${String(dayNum).padStart(2, '0')}`;
                  const dayEvents = eventsByDate[dateKey] || [];
                  const isSelected = selectedDate === dateKey;

                  return (
                    <div
                      key={dayNum}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`min-h-[96px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#234732] bg-[#E8EFEA]/50 dark:bg-[#22342A]'
                          : darkMode
                          ? 'border-[#233229] hover:bg-[#1D2B23]'
                          : 'border-[#F0ECE3] hover:bg-[#FAF8F4]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold tabular-nums ${
                            isSelected
                              ? 'bg-[#234732] text-white'
                              : ''
                          }`}
                        >
                          {dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] text-[#7A827D] tabular-nums">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(ev);
                            }}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate bg-[#E4E9E1] dark:bg-[#283E31] text-[#1E3F2B] dark:text-[#C4E3CE]"
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-[#7A827D] pl-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === 'Week' && (
            <div className="space-y-3">
              {['2025-10-12', '2025-10-13', '2025-10-14', '2025-10-15', '2025-10-16', '2025-10-17', '2025-10-18'].map(
                (dKey) => {
                  const list = eventsByDate[dKey] || [];
                  return (
                    <div
                      key={dKey}
                      className="p-3.5 rounded-xl border border-[#EAE5DC] dark:border-[#28382E] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="w-32 shrink-0">
                        <p className="text-xs font-semibold tabular-nums">{dKey}</p>
                        <p className="text-[11px] text-[#7A827D]">
                          {list.length} events
                        </p>
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {list.length === 0 ? (
                          <span className="text-xs text-[#878F8A]">No events scheduled</span>
                        ) : (
                          list.map((ev) => (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => openEditModal(ev)}
                              className="px-3 py-1.5 rounded-xl bg-[#F2EFE9] dark:bg-[#223329] text-xs font-medium"
                            >
                              {ev.startTime} · {ev.title}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {(viewMode === 'Day' || viewMode === 'Agenda') && (
            <div className="space-y-2.5">
              {(viewMode === 'Day' ? selectedDayEvents : state.events).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => openEditModal(ev)}
                  className="p-4 rounded-xl border border-[#EAE5DC] dark:border-[#28382E] flex items-center justify-between cursor-pointer hover:border-[#234732]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{ev.title}</span>
                      <span className="text-xs text-[#7A827D]">· {ev.category}</span>
                    </div>
                    <p className="text-xs text-[#6E7671] mt-1 tabular-nums">
                      {ev.date} · {ev.startTime} · {ev.location}
                    </p>
                  </div>
                  <Edit3 className="w-4 h-4 text-[#7A827D]" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Selected Day Schedule & Event Inspector */}
        <div className={`${cardSurface} lg:col-span-4 rounded-2xl border p-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Schedule for {selectedDate}</h3>
              <p className="text-xs text-[#7A827D]">
                Click any event to view or edit details
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateModal(selectedDate)}
              className="p-2 rounded-xl bg-[#E4E9E1] text-[#1E3F2B] hover:bg-[#D5DFD0]"
              aria-label="Add event on selected date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7A827D]">
              No events scheduled on {selectedDate}.
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-3.5 rounded-xl border ${
                    darkMode
                      ? 'bg-[#131C17] border-[#28382E]'
                      : 'bg-[#FAF8F4] border-[#EAE5DC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold">{ev.title}</h4>
                      <p className="text-[11px] text-[#7A827D] mt-0.5">
                        {ev.category} · {ev.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(ev)}
                        className="p-1 text-[#7A827D] hover:text-[#234732]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingEventId(ev.id)}
                        className="p-1 text-[#7A827D] hover:text-[#B84A4A]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-[#6E7671] tabular-nums">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ev.startTime}
                    </span>
                    {ev.repeat !== 'None' && (
                      <span className="flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        {ev.repeat}
                      </span>
                    )}
                    {ev.reminder !== 'None' && (
                      <span className="flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        {ev.reminder}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvent ? 'Edit Calendar Event' : 'Create Calendar Event'}
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = {
              title,
              date,
              startTime,
              endTime,
              location,
              description,
              category,
              reminder,
              repeat,
              familyMemberId: familyMemberId || undefined,
              isScheduleSlot: date === '2025-10-12',
            };
            if (selectedEvent) {
              await onUpdateEvent(selectedEvent.id, payload);
            } else {
              await onCreateEvent(payload);
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
              <label className="block text-xs font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className={inputClass}
              >
                {['Personal', 'Family', 'School', 'Work', 'Health', 'Finance', 'Other'].map(
                  (c) => (
                    <option key={c} value={c}>{c}</option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Repeat</label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as any)}
                className={inputClass}
              >
                {['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Family Member</label>
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
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              Save Event
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingEventId)}
        title="Delete this calendar event?"
        message="This action cannot be undone."
        onConfirm={() => {
          if (deletingEventId) onDeleteEvent(deletingEventId);
        }}
        onCancel={() => setDeletingEventId(null)}
        darkMode={darkMode}
      />
    </div>
  );
};
