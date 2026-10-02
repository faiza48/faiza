import React, { useState, useMemo } from 'react';
import {
  Check,
  Plus,
  Search,
  Repeat,
  Bell,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Archive,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import type {
  DailyraState,
  Task,
  TaskStatus,
  TaskPriority,
  TaskCategory,
} from '../../types/dailyra';
import { Modal, ConfirmDialog, EmptyState } from '../ui/CommonUI';

interface TasksPageProps {
  state: DailyraState;
  darkMode: boolean;
  onCreateTask: (payload: Record<string, unknown>) => Promise<void>;
  onUpdateTask: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const CATEGORIES: TaskCategory[] = [
  'Personal',
  'Work',
  'Family',
  'Shopping',
  'Bills',
  'Health',
  'Finance',
  'Other',
];

export const TasksPage: React.FC<TasksPageProps> = ({
  state,
  darkMode,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | TaskCategory>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state for Create / Edit
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Personal');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('2025-10-12');
  const [dueTime, setDueTime] = useState('03:00 PM');
  const [repeat, setRepeat] = useState<'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('None');
  const [reminder, setReminder] = useState('15 mins before');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [familyMemberId, setFamilyMemberId] = useState('');

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setCategory('Personal');
    setPriority('Medium');
    setDueDate('2025-10-12');
    setDueTime('03:00 PM');
    setRepeat('None');
    setReminder('15 mins before');
    setNotes('');
    setStatus('Pending');
    setFamilyMemberId('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setDueTime(task.dueTime);
    setRepeat(task.repeat);
    setReminder(task.reminder);
    setNotes(task.notes);
    setStatus(task.status);
    setFamilyMemberId(task.familyMemberId || '');
    setIsModalOpen(true);
  };

  const filteredTasks = useMemo(() => {
    const priorityRank: Record<TaskPriority, number> = { High: 3, Medium: 2, Low: 1 };
    return state.tasks
      .filter((t) => {
        if (statusFilter === 'All') {
          if (t.status === 'Archived') return false;
        } else if (t.status !== statusFilter) {
          return false;
        }
        if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
        if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.notes.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return priorityRank[b.priority] - priorityRank[a.priority];
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [state.tasks, statusFilter, categoryFilter, priorityFilter, sortBy, searchQuery]);

  const counts = useMemo(() => {
    const pending = state.tasks.filter((t) => t.status === 'Pending').length;
    const inProgress = state.tasks.filter((t) => t.status === 'In Progress').length;
    const completed = state.tasks.filter((t) => t.status === 'Completed').length;
    const archived = state.tasks.filter((t) => t.status === 'Archived').length;
    return { pending, inProgress, completed, archived };
  }, [state.tasks]);

  const cardSurface = darkMode
    ? 'bg-[#18231D] border-[#28382E] text-[#EDF2EE]'
    : 'bg-[#FDFCFB] border-[#EAE5DC] text-[#1F2421]';

  const inputClass = `w-full px-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-none ${
    darkMode
      ? 'bg-[#121B16] border-[#2C3E33] text-[#EDF2EE] focus:border-[#68A67D]'
      : 'bg-[#F8F6F1] border-[#E2DDD2] text-[#1F2421] focus:border-[#234732] focus:bg-white'
  }`;

  return (
    <div className="px-4 sm:px-7 py-6 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Tasks & Daily Priorities
          </h1>
          <p className="text-xs text-[#6E7671] mt-1">
            Organize your daily commitments, recurring bills, and family responsibilities.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#234732] hover:bg-[#1B3727] text-white text-xs font-medium flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending Tasks', value: counts.pending, status: 'Pending' as const },
          { label: 'In Progress', value: counts.inProgress, status: 'In Progress' as const },
          { label: 'Completed', value: counts.completed, status: 'Completed' as const },
          { label: 'Archived', value: counts.archived, status: 'Archived' as const },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setStatusFilter(item.status)}
            className={`${cardSurface} rounded-2xl border p-4 text-left transition-all cursor-pointer ${
              statusFilter === item.status ? 'ring-2 ring-[#234732]' : ''
            }`}
          >
            <p className="text-xs text-[#6E7671]">{item.label}</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{item.value}</p>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`${cardSurface} rounded-2xl border p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3`}
      >
        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F2EFE9] dark:bg-[#131C17] overflow-x-auto">
          {(['All', 'Pending', 'In Progress', 'Completed', 'Archived'] as const).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#FDFCFB] dark:bg-[#23362B] text-[#1E3F2B] dark:text-[#EDF2EE] shadow-xs font-semibold'
                    : 'text-[#6E7671] hover:text-[#1F2421]'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>

        {/* Search + Category + Priority + Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#878F8A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                darkMode
                  ? 'bg-[#121B16] border-[#2C3E33] text-[#EDF2EE]'
                  : 'bg-[#F8F6F1] border-[#E2DDD2] text-[#1F2421]'
              }`}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            aria-label="Filter by category"
            className="px-3 py-1.5 rounded-xl border text-xs bg-[#F8F6F1] dark:bg-[#121B16] border-[#E2DDD2] dark:border-[#2C3E33]"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            aria-label="Filter by priority"
            className="px-3 py-1.5 rounded-xl border text-xs bg-[#F8F6F1] dark:bg-[#121B16] border-[#E2DDD2] dark:border-[#2C3E33]"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort tasks"
            className="px-3 py-1.5 rounded-xl border text-xs bg-[#F8F6F1] dark:bg-[#121B16] border-[#E2DDD2] dark:border-[#2C3E33]"
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="Your day is clear."
          subtitle="Add something you want to accomplish or adjust your active filters."
          actionLabel="Add Task"
          onAction={openCreateModal}
          icon={<CheckCircle2 className="w-5 h-5" />}
          darkMode={darkMode}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const linkedMember = state.familyMembers.find(
              (f) => f.id === task.familyMemberId
            );

            return (
              <div
                key={task.id}
                className={`${cardSurface} rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#C5D1C8] ${
                  isCompleted ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Elegant Check Circle */}
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateTask(task.id, {
                        status: isCompleted ? 'Pending' : 'Completed',
                      })
                    }
                    className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                      isCompleted
                        ? 'bg-[#234732] border-[#234732] text-white'
                        : 'border-[#B9C2BC] hover:border-[#234732]'
                    }`}
                    aria-label={
                      isCompleted
                        ? `Mark "${task.title}" as pending`
                        : `Mark "${task.title}" as completed`
                    }
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm font-semibold ${
                          isCompleted ? 'line-through text-[#7A827D]' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      {/* Quiet Unboxed Metadata */}
                      <span className="text-xs text-[#6E7671]">
                        · {task.category} ·{' '}
                        <span
                          className={
                            task.priority === 'High'
                              ? 'text-[#C84E47] font-medium'
                              : task.priority === 'Medium'
                              ? 'text-[#B88228] font-medium'
                              : 'text-[#5A625D]'
                          }
                        >
                          {task.priority} Priority
                        </span>
                        {linkedMember && ` · For ${linkedMember.name}`}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#6E7671] mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-[#7A827D] tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {task.dueDate}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {task.dueTime}
                      </span>
                      {task.repeat !== 'None' && (
                        <span className="inline-flex items-center gap-1 text-[#234732] dark:text-[#8BD4A4] font-medium">
                          <Repeat className="w-3.5 h-3.5" />
                          Repeats {task.repeat}
                        </span>
                      )}
                      {task.reminder !== 'None' && (
                        <span className="inline-flex items-center gap-1">
                          <Bell className="w-3.5 h-3.5" />
                          Reminder: {task.reminder}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {task.status === 'Archived' ? (
                    <button
                      type="button"
                      onClick={() => onUpdateTask(task.id, { status: 'Pending' })}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-[#234732] hover:bg-[#F2EFE9] flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateTask(task.id, { status: 'Archived' })}
                      className="p-2 rounded-lg text-[#7A827D] hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
                      title="Archive task"
                      aria-label="Archive task"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openEditModal(task)}
                    className="p-2 rounded-lg text-[#7A827D] hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingTaskId(task.id)}
                    className="p-2 rounded-lg text-[#7A827D] hover:text-[#B84A4A] hover:bg-[#FDF2F2]"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        subtitle="Manage task details, recurring schedule, and reminder rules."
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = {
              title,
              description,
              category,
              priority,
              dueDate,
              dueTime,
              repeat,
              reminder,
              notes,
              status,
              familyMemberId: familyMemberId || undefined,
            };
            if (editingTask) {
              await onUpdateTask(editingTask.id, payload);
            } else {
              await onCreateTask(payload);
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
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={inputClass}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={inputClass}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Due Time</label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
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
              <label className="block text-xs font-medium mb-1">Reminder</label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className={inputClass}
              >
                {['None', 'At time', '15 mins before', '1 day before', '2 days before'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Family Member</label>
            <select
              value={familyMemberId}
              onChange={(e) => setFamilyMemberId(e.target.value)}
              className={inputClass}
            >
              <option value="">None (Personal)</option>
              {state.familyMembers.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
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
          <div>
            <label className="block text-xs font-medium mb-1">Additional Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white hover:bg-[#1B3727]"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingTaskId)}
        title="Delete this task?"
        message="This task and its linked reminder will be permanently removed. This action cannot be undone."
        onConfirm={() => {
          if (deletingTaskId) onDeleteTask(deletingTaskId);
        }}
        onCancel={() => setDeletingTaskId(null)}
        darkMode={darkMode}
      />
    </div>
  );
};
