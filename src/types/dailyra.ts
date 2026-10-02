export type NavSection =
  | 'home'
  | 'tasks'
  | 'finance'
  | 'family'
  | 'calendar'
  | 'reminders'
  | 'notes'
  | 'documents'
  | 'health'
  | 'settings';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Archived';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskCategory =
  | 'Personal'
  | 'Work'
  | 'Family'
  | 'Shopping'
  | 'Bills'
  | 'Health'
  | 'Finance'
  | 'Other';

export interface Task {
  id: string;
  adminId: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm or formatted
  location?: string;
  repeat: 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  reminder: string; // e.g., 'None', 'At time', '15 mins before', '1 day before', '2 days before'
  notes: string;
  status: TaskStatus;
  familyMemberId?: string;
  isScheduleItem?: boolean;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';
export type IncomeCategory = 'Salary' | 'Freelance' | 'Business' | 'Investment' | 'Other';
export type ExpenseCategory =
  | 'Food'
  | 'Home'
  | 'Transport'
  | 'Family'
  | 'Shopping'
  | 'Bills'
  | 'Health'
  | 'Entertainment'
  | 'Education'
  | 'Other';
export type PaymentMethod = 'Cash' | 'Bank' | 'Credit Card' | 'Debit Card' | 'Other';

export interface Transaction {
  id: string;
  adminId: string;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  description: string;
  notes: string;
  isRecurring?: boolean;
  recurringFrequency?: 'Monthly' | 'Yearly' | 'Weekly';
  familyMemberId?: string;
}

export interface Budget {
  id: string;
  adminId: string;
  category: ExpenseCategory | 'Monthly Total';
  limitAmount: number;
  month: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  adminId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  notes: string;
}

export interface FamilyActivity {
  id: string;
  familyMemberId: string;
  title: string;
  category: 'School' | 'Activities' | 'Health' | 'Tasks' | 'Important Date';
  date: string;
  time: string;
  location: string;
  notes: string;
}

export interface FamilyMember {
  id: string;
  adminId: string;
  name: string;
  photo: string;
  relationship: 'Daughter' | 'Son' | 'Spouse' | 'Mother' | 'Father' | 'Sister' | 'Brother' | 'Other';
  dateOfBirth: string; // YYYY-MM-DD
  ageText: string; // e.g. '8 years • Mar 12'
  cardTone: 'blush' | 'sky' | 'sage' | 'lavender';
  schoolInfo: string;
  gradeOrRole: string;
  allergiesOrMedical: string;
  doctorName: string;
  emergencyContact: string;
  notes: string;
  activities: FamilyActivity[];
}

export type EventCategory = 'Personal' | 'Family' | 'Work' | 'Health' | 'Finance' | 'School' | 'Other';

export interface CalendarEvent {
  id: string;
  adminId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g., '08:00 AM' or 'All Day'
  endTime: string;
  location: string;
  description: string;
  category: EventCategory;
  reminder: string;
  repeat: 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  familyMemberId?: string;
  isScheduleSlot?: boolean;
  dotColor?: 'green' | 'coral' | 'purple' | 'amber' | 'blue';
}

export type ReminderRepeat = 'One-time' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Custom';

export interface Reminder {
  id: string;
  adminId: string;
  title: string;
  time: string; // e.g. '8:00 AM'
  date: string; // YYYY-MM-DD
  repeat: ReminderRepeat;
  category: 'Health' | 'Routine' | 'Family' | 'Bills' | 'Personal' | 'Important Date';
  relatedTaskId?: string;
  familyMemberId?: string;
  enabled: boolean;
  snoozedUntil?: string;
  notificationSetting: 'Push & Sound' | 'Silent Notification' | 'Banner Only';
}

export interface NoteChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  adminId: string;
  title: string;
  content: string;
  type: 'text' | 'checklist';
  category: 'Shopping List' | 'Ideas' | 'Work Notes' | 'Family Notes' | 'Personal Notes';
  checklistItems: NoteChecklistItem[];
  pinned: boolean;
  archived: boolean;
  updatedAt: string;
  colorTone: 'cream' | 'sage' | 'blush' | 'sky' | 'lavender';
}

export interface ImportantDate {
  id: string;
  adminId: string;
  title: string;
  personOrEvent: string;
  type: 'Birthday' | 'Anniversary' | 'School date' | 'Renewal' | 'Bill date' | 'Custom';
  date: string; // YYYY-MM-DD
  recurringYearly: boolean;
  reminderDaysBefore: number;
  familyMemberId?: string;
  notes: string;
}

export interface DocumentItem {
  id: string;
  adminId: string;
  title: string;
  fileName: string;
  category: 'Personal' | 'Family' | 'Financial' | 'Health' | 'Other';
  fileType: 'PDF' | 'Image' | 'Document' | 'Archive';
  fileSize: string;
  uploadedAt: string;
  expiryDate?: string;
  familyMemberId?: string;
  notes: string;
  dataUrl?: string; // Secure authenticated content preview/download
}

export interface HealthRecord {
  id: string;
  adminId: string;
  type: 'Appointment' | 'Medication' | 'Vaccination' | 'Health Note' | 'Vital Log';
  title: string;
  date: string;
  time?: string;
  providerOrLocation: string;
  familyMemberId?: string; // Empty means Sarah Wilson (Admin)
  personName: string;
  dosageOrDetails: string;
  notes: string;
  reminderEnabled: boolean;
  status: 'Upcoming' | 'Active' | 'Completed';
}

export interface NotificationItem {
  id: string;
  adminId: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'Bills' | 'Family' | 'Tasks' | 'Finance' | 'Health' | 'System';
  read: boolean;
  targetSection: NavSection;
}

export interface AdminProfile {
  id: string;
  name: string;
  firstName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  avatar: string;
  planLabel: string;
  preferredCurrency: string;
  currencySymbol: string;
  timezone: string;
  country: string;
  motivationalQuote: string;
  sidebarQuote: string;
}

export interface DashboardWidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface AppSettings {
  adminId: string;
  appearance: 'light' | 'dark' | 'system';
  hideBalanceByDefault: boolean;
  emailNotifications: boolean;
  billAlerts: boolean;
  birthdayReminders: boolean;
  budgetWarningThreshold: number; // e.g., 80 (%)
  sessionTimeoutMinutes: number;
  privacyMaskMode: boolean;
  dashboardWidgets: DashboardWidgetConfig[];
}

export interface DailyraState {
  profile: AdminProfile;
  tasks: Task[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  familyMembers: FamilyMember[];
  events: CalendarEvent[];
  reminders: Reminder[];
  notes: Note[];
  importantDates: ImportantDate[];
  documents: DocumentItem[];
  healthRecords: HealthRecord[];
  notifications: NotificationItem[];
  settings: AppSettings;
}
