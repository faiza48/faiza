import React, { useState } from 'react';
import {
  Plus,
  Heart,
  Stethoscope,
  Pill,
  Syringe,
  FileText,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react';
import type { DailyraState, HealthRecord } from '../../types/dailyra';
import { Modal, ConfirmDialog, EmptyState } from '../ui/CommonUI';

interface HealthPageProps {
  state: DailyraState;
  darkMode: boolean;
  onCreateHealthRecord: (payload: Record<string, unknown>) => Promise<void>;
  onUpdateHealthRecord: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onDeleteHealthRecord: (id: string) => Promise<void>;
}

const RECORD_TYPES: HealthRecord['type'][] = [
  'Appointment',
  'Medication',
  'Vaccination',
  'Health Note',
];

export const HealthPage: React.FC<HealthPageProps> = ({
  state,
  darkMode,
  onCreateHealthRecord,
  onUpdateHealthRecord,
  onDeleteHealthRecord,
}) => {
  const [filterType, setFilterType] = useState<'All' | HealthRecord['type']>('All');
  const [filterPerson, setFilterPerson] = useState<string>('All');
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [type, setType] = useState<HealthRecord['type']>('Appointment');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2025-10-22');
  const [time, setTime] = useState('10:00 AM');
  const [providerOrLocation, setProviderOrLocation] = useState('');
  const [personName, setPersonName] = useState('Sarah Wilson');
  const [familyMemberId, setFamilyMemberId] = useState('');
  const [dosageOrDetails, setDosageOrDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [status, setStatus] = useState<HealthRecord['status']>('Upcoming');

  const openCreate = () => {
    setEditingRecord(null);
    setType('Appointment');
    setTitle('');
    setDate('2025-10-22');
    setTime('10:00 AM');
    setProviderOrLocation('Pacific Family Health Clinic');
    setPersonName('Sarah Wilson');
    setFamilyMemberId('');
    setDosageOrDetails('');
    setNotes('');
    setReminderEnabled(true);
    setStatus('Upcoming');
    setIsModalOpen(true);
  };

  const openEdit = (rec: HealthRecord) => {
    setEditingRecord(rec);
    setType(rec.type);
    setTitle(rec.title);
    setDate(rec.date);
    setTime(rec.time || '10:00 AM');
    setProviderOrLocation(rec.providerOrLocation);
    setPersonName(rec.personName);
    setFamilyMemberId(rec.familyMemberId || '');
    setDosageOrDetails(rec.dosageOrDetails);
    setNotes(rec.notes);
    setReminderEnabled(rec.reminderEnabled);
    setStatus(rec.status);
    setIsModalOpen(true);
  };

  const filtered = state.healthRecords.filter((rec) => {
    if (filterType !== 'All' && rec.type !== filterType) return false;
    if (filterPerson !== 'All' && rec.personName !== filterPerson) return false;
    return true;
  });

  const cardSurface = darkMode
    ? 'bg-[#18231D] border-[#28382E] text-[#EDF2EE]'
    : 'bg-[#FDFCFB] border-[#EAE5DC] text-[#1F2421]';

  const inputClass = `w-full px-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-none ${
    darkMode
      ? 'bg-[#121B16] border-[#2C3E33] text-[#EDF2EE]'
      : 'bg-[#F8F6F1] border-[#E2DDD2] text-[#1F2421]'
  }`;

  const getTypeIcon = (t: HealthRecord['type']) => {
    if (t === 'Appointment') return Stethoscope;
    if (t === 'Medication') return Pill;
    if (t === 'Vaccination') return Syringe;
    return FileText;
  };

  return (
    <div className="px-4 sm:px-7 py-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Health & Wellness Organization
          </h1>
          <p className="text-xs text-[#6E7671] mt-1">
            Private personal organization for medical appointments, medication schedules, and family immunization records.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-[#234732] hover:bg-[#1B3727] text-white text-xs font-medium flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Health Record</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['All', ...RECORD_TYPES] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap ${
                filterType === t
                  ? 'bg-[#234732] text-white font-semibold'
                  : 'bg-[#F2EFE9] dark:bg-[#18231D] text-[#5A625D] dark:text-[#A9B8AF]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A827D]">Person:</span>
          <select
            value={filterPerson}
            onChange={(e) => setFilterPerson(e.target.value)}
            className="px-3 py-1.5 rounded-xl border text-xs bg-[#FDFCFB] dark:bg-[#18231D] border-[#E2DDD2] dark:border-[#28382E]"
          >
            <option value="All">All Family Members</option>
            <option value="Sarah Wilson">Sarah Wilson</option>
            {state.familyMembers.map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No health records found."
          subtitle="Organize upcoming medical appointments, daily medications, and vaccination dates."
          actionLabel="Add Health Record"
          onAction={openCreate}
          icon={<Heart className="w-5 h-5" />}
          darkMode={darkMode}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rec) => {
            const IconComp = getTypeIcon(rec.type);
            return (
              <div
                key={rec.id}
                className={`${cardSurface} rounded-2xl border p-5 flex flex-col justify-between gap-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#FCECEC] text-[#C85252] flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#234732] dark:text-[#8BD4A4]">
                          {rec.personName}
                        </span>
                        <span className="text-[11px] text-[#7A827D]">
                          · {rec.type} · {rec.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold mt-0.5">{rec.title}</h3>
                      <p className="text-xs text-[#5A625D] dark:text-[#A9B8AF] mt-1">
                        {rec.dosageOrDetails}
                      </p>
                      {rec.notes && (
                        <p className="text-xs text-[#7A827D] mt-1">{rec.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(rec)}
                      className="p-1.5 rounded-lg text-[#7A827D] hover:bg-[#F2EFE9]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(rec.id)}
                      className="p-1.5 rounded-lg text-[#7A827D] hover:text-[#B84A4A]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#F0ECE3] dark:border-[#24332A] text-[11px] text-[#7A827D] tabular-nums">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {rec.date}
                  </span>
                  {rec.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {rec.time}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {rec.providerOrLocation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Edit Health Record' : 'Add Health Record'}
        subtitle="Appointments automatically sync with your Calendar and Family profiles."
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = {
              type,
              title,
              date,
              time,
              providerOrLocation,
              personName,
              familyMemberId: familyMemberId || undefined,
              dosageOrDetails,
              notes,
              reminderEnabled,
              status,
            };
            if (editingRecord) {
              await onUpdateHealthRecord(editingRecord.id, payload);
            } else {
              await onCreateHealthRecord(payload);
            }
            setIsModalOpen(false);
          }}
          className="space-y-3.5"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Record Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className={inputClass}
              >
                {RECORD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Person</label>
              <select
                value={personName}
                onChange={(e) => {
                  const val = e.target.value;
                  setPersonName(val);
                  const found = state.familyMembers.find((f) => f.name === val);
                  setFamilyMemberId(found ? found.id : '');
                }}
                className={inputClass}
              >
                <option value="Sarah Wilson">Sarah Wilson (Admin)</option>
                {state.familyMembers.map((f) => (
                  <option key={f.id} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Annual Dental Checkup or Vitamin D3"
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
              <label className="block text-xs font-medium mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={inputClass}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Clinic / Doctor / Location</label>
            <input
              type="text"
              value={providerOrLocation}
              onChange={(e) => setProviderOrLocation(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Dosage / Clinical Details</label>
            <input
              type="text"
              value={dosageOrDetails}
              onChange={(e) => setDosageOrDetails(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Personal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Delete this health record?"
        message="This action cannot be undone."
        onConfirm={() => {
          if (deletingId) onDeleteHealthRecord(deletingId);
        }}
        onCancel={() => setDeletingId(null)}
        darkMode={darkMode}
      />
    </div>
  );
};
