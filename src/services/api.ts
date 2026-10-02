import type { DailyraState } from '../types/dailyra';

const SESSION_TOKEN_KEY = 'dailyra_auth_token';

let memorySessionToken: string | null = null;

export function getStoredSessionToken(): string | null {
  if (memorySessionToken) return memorySessionToken;
  try {
    const val = localStorage.getItem(SESSION_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (val) memorySessionToken = val;
    return val;
  } catch {
    return memorySessionToken;
  }
}

export function setStoredSessionToken(token: string | null, rememberMe = true): void {
  memorySessionToken = token;
  try {
    if (!token) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      return;
    }
    if (rememberMe) {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    }
  } catch {
    // Ignore storage access errors in restricted frames
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      (data && data.error) || 'Something went wrong. Please try again.';
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return data as T;
}

export const dailyraApi = {
  checkSession: () =>
    request<{
      authenticated: boolean;
      admin?: { id: string; name: string; email: string };
      adminEmailHint?: string;
      sessionsCount?: number;
    }>('/api/auth/session'),

  login: async (email: string, password: string, rememberMe: boolean) => {
    const res = await request<{
      authenticated: boolean;
      sessionToken: string;
      admin: { id: string; name: string; email: string };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
    if (res.sessionToken) {
      setStoredSessionToken(res.sessionToken, rememberMe);
    }
    return res;
  },

  logout: async () => {
    await request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
    setStoredSessionToken(null);
  },

  recoverPassword: (email: string, dateOfBirth: string, newPassword: string) =>
    request<{ success: boolean; message: string }>('/api/auth/recover-password', {
      method: 'POST',
      body: JSON.stringify({ email, dateOfBirth, newPassword }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  getState: () => request<DailyraState>('/api/data/state'),

  // Tasks
  createTask: (task: Record<string, unknown>) =>
    request<DailyraState>('/api/data/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
  updateTask: (id: string, updates: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteTask: (id: string) =>
    request<DailyraState>(`/api/data/tasks/${id}`, { method: 'DELETE' }),

  // Transactions
  createTransaction: (tx: Record<string, unknown>) =>
    request<DailyraState>('/api/data/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    }),
  updateTransaction: (id: string, updates: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteTransaction: (id: string) =>
    request<DailyraState>(`/api/data/transactions/${id}`, { method: 'DELETE' }),

  // Budgets & Savings
  updateBudget: (id: string, limitAmount: number) =>
    request<DailyraState>(`/api/data/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ limitAmount }),
    }),
  createSavingsGoal: (goal: Record<string, unknown>) =>
    request<DailyraState>('/api/data/savings-goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    }),
  updateSavingsGoal: (id: string, updates: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/savings-goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteSavingsGoal: (id: string) =>
    request<DailyraState>(`/api/data/savings-goals/${id}`, { method: 'DELETE' }),

  // Family
  createFamilyMember: (member: Record<string, unknown>) =>
    request<DailyraState>('/api/data/family', {
      method: 'POST',
      body: JSON.stringify(member),
    }),
  updateFamilyMember: (id: string, updates: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/family/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteFamilyMember: (id: string) =>
    request<DailyraState>(`/api/data/family/${id}`, { method: 'DELETE' }),
  addFamilyActivity: (memberId: string, activity: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/family/${memberId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activity),
    }),
  deleteFamilyActivity: (memberId: string, actId: string) =>
    request<DailyraState>(`/api/data/family/${memberId}/activities/${actId}`, {
      method: 'DELETE',
    }),

  // Events
  createEvent: (ev: Record<string, unknown>) =>
    request<DailyraState>('/api/data/events', {
      method: 'POST',
      body: JSON.stringify(ev),
    }),
  updateEvent: (id: string, updates: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteEvent: (id: string) =>
    request<DailyraState>(`/api/data/events/${id}`, { method: 'DELETE' }),

  // Reminders
  createReminder: (rem: Record<string, unknown>) =>
    request<DailyraState>('/api/data/reminders', {
      method: 'POST',
      body: JSON.stringify(rem),
    }),
  updateReminder: (id: string, updates: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteReminder: (id: string) =>
    request<DailyraState>(`/api/data/reminders/${id}`, { method: 'DELETE' }),

  // Notes
  createNote: (note: Record<string, unknown>) =>
    request<DailyraState>('/api/data/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    }),
  updateNote: (id: string, updates: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteNote: (id: string) =>
    request<DailyraState>(`/api/data/notes/${id}`, { method: 'DELETE' }),

  // Important Dates
  createImportantDate: (item: Record<string, unknown>) =>
    request<DailyraState>('/api/data/important-dates', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  updateImportantDate: (id: string, updates: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/important-dates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteImportantDate: (id: string) =>
    request<DailyraState>(`/api/data/important-dates/${id}`, { method: 'DELETE' }),

  // Documents
  createDocument: (doc: Record<string, unknown>) =>
    request<DailyraState>('/api/data/documents', {
      method: 'POST',
      body: JSON.stringify(doc),
    }),
  updateDocument: (id: string, updates: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteDocument: (id: string) =>
    request<DailyraState>(`/api/data/documents/${id}`, { method: 'DELETE' }),

  // Health
  createHealthRecord: (record: Record<string, unknown>) =>
    request<DailyraState>('/api/data/health', {
      method: 'POST',
      body: JSON.stringify(record),
    }),
  updateHealthRecord: (id: string, updates: Record<string, unknown>) =>
    request<DailyraState>(`/api/data/health/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteHealthRecord: (id: string) =>
    request<DailyraState>(`/api/data/health/${id}`, { method: 'DELETE' }),

  // Notifications
  markNotificationRead: (id: string) =>
    request<DailyraState>(`/api/data/notifications/${id}`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request<DailyraState>('/api/data/notifications/mark-all-read', {
      method: 'POST',
    }),
  deleteNotification: (id: string) =>
    request<DailyraState>(`/api/data/notifications/${id}`, { method: 'DELETE' }),

  // Profile & Settings
  updateProfile: (updates: Record<string, unknown>) =>
    request<DailyraState>('/api/data/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  updateSettings: (updates: Record<string, unknown>) =>
    request<DailyraState>('/api/data/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  importBackup: (state: DailyraState) =>
    request<DailyraState>('/api/data/import', {
      method: 'POST',
      body: JSON.stringify({ state }),
    }),
  resetDemoData: () =>
    request<DailyraState>('/api/data/reset-demo', { method: 'POST' }),
};
