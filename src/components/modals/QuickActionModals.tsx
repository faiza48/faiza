import React, { useState } from 'react';
import { CalendarHeart, Trash2, Plus, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import type {
  DailyraState,
  TaskCategory,
  TaskPriority,
  ExpenseCategory,
  IncomeCategory,
  PaymentMethod,
  EventCategory,
  ReminderRepeat,
} from '../../types/dailyra';
import { Modal } from '../ui/CommonUI';

export type QuickActionType =
  | 'task'
  | 'transaction'
  | 'event'
  | 'reminder'
  | 'note'
  | 'family'
  | 'document'
  | 'important-dates'
  | 'customize-dashboard'
  | null;

interface QuickActionModalsProps {
  activeModal: QuickActionType;
  onClose: () => void;
  state: DailyraState;
  darkMode: boolean;
  onCreateTask: (payload: Record<string, unknown>) => Promise<void>;
  onCreateTransaction: (payload: Record<string, unknown>) => Promise<void>;
  onCreateEvent: (payload: Record<string, unknown>) => Promise<void>;
  onCreateReminder: (payload: Record<string, unknown>) => Promise<void>;
  onCreateNote: (payload: Record<string, unknown>) => Promise<void>;
  onCreateFamilyMember: (payload: Record<string, unknown>) => Promise<void>;
  onCreateDocument: (payload: Record<string, unknown>) => Promise<void>;
  onCreateImportantDate: (payload: Record<string, unknown>) => Promise<void>;
  onDeleteImportantDate: (id: string) => Promise<void>;
  onUpdateSettings: (updates: Record<string, unknown>) => Promise<void>;
}

export const QuickActionModals: React.FC<QuickActionModalsProps> = ({
  activeModal,
  onClose,
  state,
  darkMode,
  onCreateTask,
  onCreateTransaction,
  onCreateEvent,
  onCreateReminder,
  onCreateNote,
  onCreateFamilyMember,
  onCreateDocument,
  onCreateImportantDate,
  onDeleteImportantDate,
  onUpdateSettings,
}) => {
  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCat, setTaskCat] = useState<TaskCategory>('Personal');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskDate, setTaskDate] = useState('2025-10-12');
  const [taskTime, setTaskTime] = useState('04:00 PM');
  const [taskRepeat, setTaskRepeat] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('None');
  const [taskReminder, setTaskReminder] = useState('15 mins before');
  const [taskFamilyId, setTaskFamilyId] = useState('');
  const [taskSchedule, setTaskSchedule] = useState(true);

  // Transaction form
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState<ExpenseCategory | IncomeCategory>('Food');
  const [txDate, setTxDate] = useState('2025-10-12');
  const [txMethod, setTxMethod] = useState<PaymentMethod>('Credit Card');
  const [txNotes, setTxNotes] = useState('');
  const [txLinkReminder, setTxLinkReminder] = useState(false);

  // Event form
  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState('2025-10-14');
  const [evStart, setEvStart] = useState('03:00 PM');
  const [evEnd, setEvEnd] = useState('04:00 PM');
  const [evLocation, setEvLocation] = useState('School');
  const [evCategory, setEvCategory] = useState<EventCategory>('Family');
  const [evFamilyId, setEvFamilyId] = useState('');
  const [evDesc, setEvDesc] = useState('');

  // Reminder form
  const [remTitle, setRemTitle] = useState('');
  const [remTime, setRemTime] = useState('08:00 AM');
  const [remDate, setRemDate] = useState('2025-10-12');
  const [remRepeat, setRemRepeat] = useState<ReminderRepeat>('Daily');
  const [remCategory, setRemCategory] = useState<'Health' | 'Routine' | 'Family' | 'Bills' | 'Personal'>('Routine');

  // Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState<'Shopping List' | 'Ideas' | 'Work Notes' | 'Family Notes' | 'Personal Notes'>('Personal Notes');
  const [noteType, setNoteType] = useState<'text' | 'checklist'>('text');
  const [noteContent, setNoteContent] = useState('');

  // Family form
  const [famName, setFamName] = useState('');
  const [famRel, setFamRel] = useState<'Daughter' | 'Son' | 'Spouse' | 'Mother' | 'Father' | 'Sister' | 'Brother' | 'Other'>('Daughter');
  const [famDob, setFamDob] = useState('2018-05-12');
  const [famAgeText, setFamAgeText] = useState('7 years • May 12');
  const [famSchool, setFamSchool] = useState('');
  const [famNotes, setFamNotes] = useState('');

  // Document form
  const [docTitle, setDocTitle] = useState('');
  const [docCat, setDocCat] = useState<'Personal' | 'Family' | 'Financial' | 'Health' | 'Other'>('Personal');
  const [docNotes, setDocNotes] = useState('');
  const [docFileName, setDocFileName] = useState('');

  // Important Date form
  const [idTitle, setIdTitle] = useState('');
  const [idPerson, setIdPerson] = useState('');
  const [idType, setIdType] = useState<'Birthday' | 'Anniversary' | 'School date' | 'Renewal' | 'Bill date' | 'Custom'>('Birthday');
  const [idDate, setIdDate] = useState('2025-10-25');
  const [idDaysBefore, setIdDaysBefore] = useState(7);

  const inputClass = `w-full px-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-none ${
    darkMode
      ? 'bg-[#121B16] border-[#2C3E33] text-[#EDF2EE] focus:border-[#68A67D]'
      : 'bg-[#F8F6F1] border-[#E2DDD2] text-[#1F2421] focus:border-[#234732] focus:bg-white'
  }`;

  const getDaysRemaining = (dateStr: string) => {
    const ref = new Date('2025-10-12T00:00:00');
    const target = new Date(`${dateStr}T00:00:00`);
    const diff = Math.ceil((target.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff > 1) return `In ${diff} days`;
    return `${Math.abs(diff)} days ago`;
  };

  return (
    <>
      {/* 1. Quick Add Task Modal */}
      <Modal
        isOpen={activeModal === 'task'}
        onClose={onClose}
        title="Add New Task"
        subtitle="Create a personal task and optionally sync it with your schedule & reminders."
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreateTask({
              title: taskTitle,
              description: taskDesc,
              category: taskCat,
              priority: taskPriority,
              dueDate: taskDate,
              dueTime: taskTime,
              repeat: taskRepeat,
              reminder: taskReminder,
              familyMemberId: taskFamilyId || undefined,
              isScheduleItem: taskSchedule,
              status: 'Pending',
            });
            setTaskTitle('');
            setTaskDesc('');
            onClose();
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g., Pay electricity bill or Pick up Emma"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={taskCat}
                onChange={(e) => setTaskCat(e.target.value as TaskCategory)}
                className={inputClass}
              >
                {['Personal', 'Work', 'Family', 'Shopping', 'Bills', 'Health', 'Finance', 'Other'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className={inputClass}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Due Time</label>
              <input
                type="text"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                placeholder="03:00 PM"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Repeat</label>
              <select
                value={taskRepeat}
                onChange={(e) => setTaskRepeat(e.target.value as any)}
                className={inputClass}
              >
                {['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Reminder</label>
              <select
                value={taskReminder}
                onChange={(e) => setTaskReminder(e.target.value)}
                className={inputClass}
              >
                {['None', 'At time', '15 mins before', '1 day before', '2 days before'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Related Family Member (Optional)</label>
            <select
              value={taskFamilyId}
              onChange={(e) => setTaskFamilyId(e.target.value)}
              className={inputClass}
            >
              <option value="">None (Sarah Wilson)</option>
              {state.familyMembers.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.relationship})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Helpful details..."
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={taskSchedule}
              onChange={(e) => setTaskSchedule(e.target.checked)}
              className="rounded text-[#234732]"
            />
            <span>Also display on Today’s Schedule & Calendar</span>
          </label>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E2DDD2] hover:bg-[#F2EFE9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727]"
            >
              Save Task
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Quick Add Income / Expense Modal */}
      <Modal
        isOpen={activeModal === 'transaction'}
        onClose={onClose}
        title="Add Income or Expense"
        subtitle="Record a financial transaction and update your monthly balance & budgets."
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreateTransaction({
              type: txType,
              description: txDesc,
              amount: Number(txAmount),
              category: txCategory,
              date: txDate,
              paymentMethod: txMethod,
              notes: txNotes,
              createLinkedReminder: txLinkReminder,
            });
            setTxDesc('');
            setTxAmount('');
            setTxNotes('');
            onClose();
          }}
          className="space-y-3.5"
        >
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F2EFE9] dark:bg-[#121B16]">
            <button
              type="button"
              onClick={() => {
                setTxType('expense');
                setTxCategory('Food');
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                txType === 'expense'
                  ? 'bg-[#FDFCFB] dark:bg-[#23362B] text-[#B84A4A] shadow-xs'
                  : 'text-[#6E7671]'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setTxType('income');
                setTxCategory('Salary');
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                txType === 'income'
                  ? 'bg-[#FDFCFB] dark:bg-[#23362B] text-[#234732] dark:text-[#8BD4A4] shadow-xs'
                  : 'text-[#6E7671]'
              }`}
            >
              Income (+)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Description *</label>
              <input
                type="text"
                required
                value={txDesc}
                onChange={(e) => setTxDesc(e.target.value)}
                placeholder={txType === 'expense' ? 'e.g., Grocery Store' : 'e.g., Monthly Salary'}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Amount ($) *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="125.00"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value as any)}
                className={inputClass}
              >
                {(txType === 'income'
                  ? ['Salary', 'Freelance', 'Business', 'Investment', 'Other']
                  : ['Food', 'Home', 'Transport', 'Family', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other']
                ).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Payment Method</label>
              <select
                value={txMethod}
                onChange={(e) => setTxMethod(e.target.value as PaymentMethod)}
                className={inputClass}
              >
                {['Credit Card', 'Debit Card', 'Bank', 'Cash', 'Other'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Notes</label>
            <input
              type="text"
              value={txNotes}
              onChange={(e) => setTxNotes(e.target.value)}
              placeholder="Optional receipt note or reference"
              className={inputClass}
            />
          </div>

          {txType === 'expense' && (
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={txLinkReminder}
                onChange={(e) => setTxLinkReminder(e.target.checked)}
                className="rounded text-[#234732]"
              />
              <span>Create a recurring monthly bill reminder for this expense</span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727]"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Quick Add Calendar Event Modal */}
      <Modal
        isOpen={activeModal === 'event'}
        onClose={onClose}
        title="Add Calendar Event"
        subtitle="Schedule an event connected to your dashboard, family profiles, and reminders."
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreateEvent({
              title: evTitle,
              date: evDate,
              startTime: evStart,
              endTime: evEnd,
              location: evLocation,
              category: evCategory,
              familyMemberId: evFamilyId || undefined,
              description: evDesc,
              isScheduleSlot: evDate === '2025-10-12',
            });
            setEvTitle('');
            setEvDesc('');
            onClose();
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
              placeholder="e.g., Emma's School Recital or Doctor Appointment"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <input
                type="date"
                value={evDate}
                onChange={(e) => setEvDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Start Time</label>
              <input
                type="text"
                value={evStart}
                onChange={(e) => setEvStart(e.target.value)}
                placeholder="3:00 PM"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">End Time</label>
              <input
                type="text"
                value={evEnd}
                onChange={(e) => setEvEnd(e.target.value)}
                placeholder="4:00 PM"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={evCategory}
                onChange={(e) => setEvCategory(e.target.value as EventCategory)}
                className={inputClass}
              >
                {['Personal', 'Family', 'School', 'Work', 'Health', 'Finance', 'Other'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Location</label>
              <input
                type="text"
                value={evLocation}
                onChange={(e) => setEvLocation(e.target.value)}
                placeholder="School, Home, Clinic..."
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Link to Family Member</label>
            <select
              value={evFamilyId}
              onChange={(e) => setEvFamilyId(e.target.value)}
              className={inputClass}
            >
              <option value="">None</option>
              {state.familyMembers.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.relationship})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <textarea
              rows={2}
              value={evDesc}
              onChange={(e) => setEvDesc(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727]"
            >
              Save Event
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Quick Add Reminder Modal */}
      <Modal
        isOpen={activeModal === 'reminder'}
        onClose={onClose}
        title="Add Reminder / Alarm"
        subtitle="Set a one-time or recurring daily/monthly reminder."
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreateReminder({
              title: remTitle,
              time: remTime,
              date: remDate,
              repeat: remRepeat,
              category: remCategory,
              enabled: true,
            });
            setRemTitle('');
            onClose();
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Reminder Title *</label>
            <input
              type="text"
              required
              value={remTitle}
              onChange={(e) => setRemTitle(e.target.value)}
              placeholder="e.g., Medicine, Wake up, Water plants"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Time</label>
              <input
                type="text"
                value={remTime}
                onChange={(e) => setRemTime(e.target.value)}
                placeholder="8:00 AM"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Repeat</label>
              <select
                value={remRepeat}
                onChange={(e) => setRemRepeat(e.target.value as ReminderRepeat)}
                className={inputClass}
              >
                {['Daily', 'Weekly', 'Monthly', 'Yearly', 'One-time'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={remCategory}
                onChange={(e) => setRemCategory(e.target.value as any)}
                className={inputClass}
              >
                {['Routine', 'Health', 'Family', 'Bills', 'Personal'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727]"
            >
              Create Reminder
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Quick Add Note Modal */}
      <Modal
        isOpen={activeModal === 'note'}
        onClose={onClose}
        title="Add Quick Note"
        subtitle="Capture an idea, shopping list, work note, or family memo."
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const checklistItems =
              noteType === 'checklist'
                ? noteContent
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((text, idx) => ({ id: `ci-${Date.now()}-${idx}`, text, completed: false }))
                : [];
            await onCreateNote({
              title: noteTitle,
              category: noteCategory,
              type: noteType,
              content: noteContent,
              checklistItems,
              pinned: true,
              colorTone: 'cream',
            });
            setNoteTitle('');
            setNoteContent('');
            onClose();
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Note Title *</label>
            <input
              type="text"
              required
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g., Weekend Shopping List or Autumn Ideas"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value as any)}
                className={inputClass}
              >
                {['Shopping List', 'Ideas', 'Work Notes', 'Family Notes', 'Personal Notes'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Note Format</label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as any)}
                className={inputClass}
              >
                <option value="text">Standard Note</option>
                <option value="checklist">Checklist (One item per line)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              {noteType === 'checklist' ? 'Checklist Items (one per line)' : 'Note Content'}
            </label>
            <textarea
              rows={4}
              required
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder={
                noteType === 'checklist'
                  ? 'Organic Milk\nPasture-raised Eggs\nHoneycrisp Apples'
                  : 'Write your thoughts here...'
              }
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727]"
            >
              Save Note
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Quick Add Family Member Modal */}
      <Modal
        isOpen={activeModal === 'family'}
        onClose={onClose}
        title="Add Family Member"
        subtitle="Add a family member profile. Their birthday will automatically sync to Important Dates."
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreateFamilyMember({
              name: famName,
              relationship: famRel,
              dateOfBirth: famDob,
              ageText: famAgeText,
              schoolInfo: famSchool,
              notes: famNotes,
              photo: famRel === 'Son' || famRel === 'Father' || famRel === 'Brother' ? 'adam' : 'emma',
              cardTone: famRel === 'Son' ? 'sky' : famRel === 'Daughter' ? 'blush' : 'sage',
            });
            setFamName('');
            setFamSchool('');
            setFamNotes('');
            onClose();
          }}
          className="space-y-3.5"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={famName}
                onChange={(e) => setFamName(e.target.value)}
                placeholder="e.g., David Wilson"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Relationship</label>
              <select
                value={famRel}
                onChange={(e) => setFamRel(e.target.value as any)}
                className={inputClass}
              >
                {['Daughter', 'Son', 'Spouse', 'Mother', 'Father', 'Sister', 'Brother', 'Other'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                value={famDob}
                onChange={(e) => setFamDob(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Age / Birthday Label</label>
              <input
                type="text"
                value={famAgeText}
                onChange={(e) => setFamAgeText(e.target.value)}
                placeholder="8 years • Mar 12"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">School / Occupation Info</label>
            <input
              type="text"
              value={famSchool}
              onChange={(e) => setFamSchool(e.target.value)}
              placeholder="School name, grade, or role"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Notes & Medical Info</label>
            <textarea
              rows={2}
              value={famNotes}
              onChange={(e) => setFamNotes(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727]"
            >
              Add Family Member
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Quick Add Document Modal */}
      <Modal
        isOpen={activeModal === 'document'}
        onClose={onClose}
        title="Upload Private Document"
        subtitle="Store a document in your encrypted personal vault."
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreateDocument({
              title: docTitle,
              category: docCat,
              fileName: docFileName || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
              fileType: 'PDF',
              fileSize: '1.4 MB',
              notes: docNotes,
            });
            setDocTitle('');
            setDocNotes('');
            setDocFileName('');
            onClose();
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Document Title *</label>
            <input
              type="text"
              required
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g., Home Insurance Policy 2025 orEmma Birth Certificate"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={docCat}
                onChange={(e) => setDocCat(e.target.value as any)}
                className={inputClass}
              >
                {['Personal', 'Family', 'Financial', 'Health', 'Other'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Select File</label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setDocFileName(file.name);
                }}
                className="w-full text-xs text-[#6E7671] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#E4E9E1] file:text-[#1E3F2B]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Vault Notes</label>
            <textarea
              rows={2}
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              placeholder="Policy number, renewal instructions, or location..."
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727]"
            >
              Upload to Vault
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. Important Dates Manager Modal (Section 18) */}
      <Modal
        isOpen={activeModal === 'important-dates'}
        onClose={onClose}
        title="Important Dates & Milestones"
        subtitle="Birthdays, anniversaries, school dates, renewals, and recurring life milestones."
        maxWidth="max-w-2xl"
        darkMode={darkMode}
      >
        <div className="space-y-5">
          {/* Existing Important Dates List */}
          <div className="space-y-2.5">
            {state.importantDates.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  darkMode
                    ? 'bg-[#131C17] border-[#28382E]'
                    : 'bg-[#F8F6F1] border-[#E6E1D6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FCEEEE] text-[#C45A5A] flex items-center justify-center shrink-0">
                    <CalendarHeart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold">{item.title}</h4>
                      <span className="text-[11px] text-[#7A827D]">
                        · {item.type} · {item.personOrEvent}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E7671] mt-0.5">
                      Date: <strong className="tabular-nums">{item.date}</strong> · Reminder:{' '}
                      {item.reminderDaysBefore} days before
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#234732] dark:text-[#8BD4A4] tabular-nums">
                    {getDaysRemaining(item.date)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteImportantDate(item.id)}
                    className="p-1.5 text-[#878F8A] hover:text-[#B84A4A] rounded-lg"
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Important Date Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await onCreateImportantDate({
                title: idTitle,
                personOrEvent: idPerson || idTitle,
                type: idType,
                date: idDate,
                reminderDaysBefore: idDaysBefore,
                recurringYearly: true,
              });
              setIdTitle('');
              setIdPerson('');
            }}
            className={`p-4 rounded-2xl border space-y-3 ${
              darkMode ? 'bg-[#141E18] border-[#28382E]' : 'bg-[#FAF8F3] border-[#E5E0D5]'
            }`}
          >
            <h4 className="text-xs font-semibold flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#234732]" />
              <span>Add Important Date (Auto-syncs with Calendar & Reminders)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={idTitle}
                onChange={(e) => setIdTitle(e.target.value)}
                placeholder="Title (e.g., Wedding Anniversary)"
                className={inputClass}
              />
              <input
                type="text"
                value={idPerson}
                onChange={(e) => setIdPerson(e.target.value)}
                placeholder="Person or Event"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value as any)}
                className={inputClass}
              >
                {['Birthday', 'Anniversary', 'School date', 'Renewal', 'Bill date', 'Custom'].map(
                  (t) => (
                    <option key={t} value={t}>{t}</option>
                  )
                )}
              </select>
              <input
                type="date"
                value={idDate}
                onChange={(e) => setIdDate(e.target.value)}
                className={inputClass}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727]"
              >
                Add Milestone
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* 9. Dashboard Personalization Modal (Section 26) */}
      <Modal
        isOpen={activeModal === 'customize-dashboard'}
        onClose={onClose}
        title="Personalize Home Dashboard"
        subtitle="Show, hide, or reorder your Dailyra dashboard modules."
        darkMode={darkMode}
      >
        <div className="space-y-3">
          {state.settings.dashboardWidgets
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((widget, idx, arr) => (
              <div
                key={widget.id}
                className={`px-4 py-3 rounded-xl border flex items-center justify-between ${
                  darkMode
                    ? 'bg-[#141E18] border-[#28382E]'
                    : 'bg-[#F8F6F1] border-[#E5E0D5]'
                }`}
              >
                <span className="text-xs font-medium">{widget.label}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => {
                      const sorted = [...arr];
                      const temp = sorted[idx - 1].order;
                      sorted[idx - 1].order = sorted[idx].order;
                      sorted[idx].order = temp;
                      onUpdateSettings({ dashboardWidgets: sorted });
                    }}
                    className="p-1.5 rounded-lg text-[#7A827D] hover:bg-black/5 disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === arr.length - 1}
                    onClick={() => {
                      const sorted = [...arr];
                      const temp = sorted[idx + 1].order;
                      sorted[idx + 1].order = sorted[idx].order;
                      sorted[idx].order = temp;
                      onUpdateSettings({ dashboardWidgets: sorted });
                    }}
                    className="p-1.5 rounded-lg text-[#7A827D] hover:bg-black/5 disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = state.settings.dashboardWidgets.map((w) =>
                        w.id === widget.id ? { ...w, visible: !w.visible } : w
                      );
                      onUpdateSettings({ dashboardWidgets: updated });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                      widget.visible
                        ? 'bg-[#E4E9E1] text-[#1E3F2B]'
                        : 'bg-[#EAE5DC] text-[#7A827D]'
                    }`}
                  >
                    {widget.visible ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </Modal>
    </>
  );
};
