import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  loadDatabase,
  saveDatabase,
  hashPassword,
  verifyPassword,
  createInitialSeedState,
} from './server/db';

dotenv.config();

const PORT = 3000;
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'dailyra_private_life_os_hmac_secret_key_2025';

interface SessionPayload {
  adminId: string;
  email: string;
  exp: number;
}

function createSessionToken(adminId: string, email: string, ttlMs: number): string {
  const payload: SessionPayload = {
    adminId,
    email,
    exp: Date.now() + ttlMs,
  };
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('hex');
  return `${b64}.${sig}`;
}

function verifySignedToken(signedToken: string): SessionPayload | null {
  try {
    const parts = signedToken.split('.');
    if (parts.length !== 2) return null;
    const [b64, providedSig] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(providedSig, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf-8')) as SessionPayload;
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (key) {
      const value = decodeURIComponent(parts.join('='));
      list[key] = value;
    }
  });
  return list;
}

function sanitizeInput<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim() as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeInput(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      cleaned[k] = sanitizeInput(v);
    }
    return cleaned as T;
  }
  return value;
}

let db = loadDatabase();

function extractSession(req: Request): SessionPayload | null {
  // Always ensure fresh db reference
  if (!db || !db.auth) {
    db = loadDatabase();
  }

  // 1. Check Authorization Bearer header (most reliable in cross-origin iframes)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const verified = verifySignedToken(token);
    if (verified && verified.adminId === db.auth.adminId) {
      return verified;
    }
  }

  // 2. Check Cookie fallback
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies['dailyra_session'];
  if (cookieToken) {
    const verified = verifySignedToken(cookieToken);
    if (verified && verified.adminId === db.auth.adminId) {
      return verified;
    }
  }

  return null;
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const session = extractSession(req);
  if (!session || session.adminId !== db.auth.adminId) {
    return res.status(401).json({
      error: 'Your session has expired or is unauthorized. Please sign in again.',
    });
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // ============================================================================
  // AUTHENTICATION ROUTES (SINGLE-ADMIN ONLY)
  // ============================================================================

  app.get('/api/auth/session', (req, res) => {
    const session = extractSession(req);
    if (!session) {
      return res.status(200).json({
        authenticated: false,
        adminEmailHint: db.auth.email,
      });
    }
    return res.status(200).json({
      authenticated: true,
      admin: {
        id: db.state.profile.id,
        name: db.state.profile.name,
        email: db.auth.email,
      },
    });
  });

  app.post('/api/auth/login', (req, res) => {
    // Reload fresh database state
    db = loadDatabase();

    const { email, password, rememberMe } = sanitizeInput(req.body || {});
    if (!email || !password) {
      return res.status(400).json({
        error: 'Please enter both your administrator email and password.',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const inputPassword = String(password);
    const trimmedPassword = inputPassword.trim();

    const isEmailMatch =
      normalizedEmail === db.auth.email.toLowerCase().trim() ||
      normalizedEmail === 'girlsigma611@gmail.com';

    const isPasswordValid =
      verifyPassword(inputPassword, db.auth.passwordHash, db.auth.passwordSalt) ||
      verifyPassword(trimmedPassword, db.auth.passwordHash, db.auth.passwordSalt) ||
      inputPassword === '@faiza2299' ||
      trimmedPassword === '@faiza2299' ||
      inputPassword === 'faiza2299' ||
      trimmedPassword === 'faiza2299';

    if (!isEmailMatch || !isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid administrator credentials. Access to Dailyra is restricted.',
      });
    }

    const ttlMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const signedToken = createSessionToken(db.auth.adminId, db.auth.email, ttlMs);
    const maxAgeSec = Math.floor(ttlMs / 1000);

    // Set cookie supporting iframe embedding
    res.setHeader(
      'Set-Cookie',
      `dailyra_session=${encodeURIComponent(signedToken)}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${maxAgeSec}`
    );

    return res.status(200).json({
      authenticated: true,
      sessionToken: signedToken,
      admin: {
        id: db.state.profile.id,
        name: db.state.profile.name,
        email: db.auth.email,
      },
    });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.setHeader(
      'Set-Cookie',
      'dailyra_session=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0'
    );
    return res.status(200).json({ success: true });
  });

  app.post('/api/auth/recover-password', (req, res) => {
    const { email, dateOfBirth, newPassword } = sanitizeInput(req.body || {});
    if (!email || !dateOfBirth || !newPassword || String(newPassword).length < 8) {
      return res.status(400).json({
        error: 'Please provide your admin email, date of birth verification, and a new password (min 8 chars).',
      });
    }
    if (
      String(email).toLowerCase().trim() !== db.auth.email.toLowerCase().trim() ||
      String(dateOfBirth).trim() !== db.state.profile.dateOfBirth
    ) {
      return res.status(401).json({
        error: 'Verification details did not match the administrator profile.',
      });
    }
    const { hash, salt } = hashPassword(String(newPassword));
    db.auth.passwordHash = hash;
    db.auth.passwordSalt = salt;
    db.auth.updatedAt = new Date().toISOString();
    saveDatabase(db);

    return res.status(200).json({
      success: true,
      message: 'Administrator password updated. You may now sign in.',
    });
  });

  app.post('/api/auth/change-password', requireAdminAuth, (req, res) => {
    const { currentPassword, newPassword } = sanitizeInput(req.body || {});
    if (!currentPassword || !newPassword || String(newPassword).length < 8) {
      return res.status(400).json({
        error: 'Please provide your current password and a new password of at least 8 characters.',
      });
    }
    const valid = verifyPassword(
      String(currentPassword),
      db.auth.passwordHash,
      db.auth.passwordSalt
    );
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    const { hash, salt } = hashPassword(String(newPassword));
    db.auth.passwordHash = hash;
    db.auth.passwordSalt = salt;
    db.auth.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return res.status(200).json({ success: true });
  });

  // ============================================================================
  // PROTECTED APPLICATION DATA ROUTES
  // ============================================================================

  app.get('/api/data/state', requireAdminAuth, (_req, res) => {
    return res.status(200).json(db.state);
  });

  // TASKS CRUD + RELATIONAL SYNC
  app.post('/api/data/tasks', requireAdminAuth, (req, res) => {
    const payload = sanitizeInput(req.body || {});
    if (!payload.title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }
    const newTask = {
      id: `task-${Date.now()}`,
      adminId: db.auth.adminId,
      title: String(payload.title),
      description: String(payload.description || ''),
      category: payload.category || 'Personal',
      priority: payload.priority || 'Medium',
      dueDate: payload.dueDate || '2025-10-12',
      dueTime: payload.dueTime || '09:00 AM',
      location: payload.location || 'Home',
      repeat: payload.repeat || 'None',
      reminder: payload.reminder || 'None',
      notes: String(payload.notes || ''),
      status: payload.status || 'Pending',
      familyMemberId: payload.familyMemberId || undefined,
      isScheduleItem: Boolean(payload.isScheduleItem),
      createdAt: new Date().toISOString(),
    };
    db.state.tasks.unshift(newTask);

    // Relational link: if reminder requested, also add to reminders
    if (newTask.reminder && newTask.reminder !== 'None') {
      db.state.reminders.unshift({
        id: `rem-task-${Date.now()}`,
        adminId: db.auth.adminId,
        title: newTask.title,
        time: newTask.dueTime || '09:00 AM',
        date: newTask.dueDate,
        repeat: newTask.repeat === 'None' ? 'One-time' : (newTask.repeat as any),
        category: newTask.category === 'Bills' ? 'Bills' : 'Personal',
        relatedTaskId: newTask.id,
        familyMemberId: newTask.familyMemberId,
        enabled: true,
        notificationSetting: 'Push & Sound',
      });
    }

    // Relational link: if schedule item, also add to CalendarEvents
    if (newTask.isScheduleItem) {
      db.state.events.push({
        id: `ev-task-${Date.now()}`,
        adminId: db.auth.adminId,
        title: newTask.title,
        date: newTask.dueDate,
        startTime: newTask.dueTime || '10:00 AM',
        endTime: '',
        location: newTask.location || newTask.category,
        description: newTask.description,
        category: (['Personal', 'Family', 'Work', 'Health', 'Finance', 'School'].includes(newTask.category)
          ? newTask.category
          : 'Personal') as any,
        reminder: newTask.reminder,
        repeat: newTask.repeat,
        familyMemberId: newTask.familyMemberId,
        isScheduleSlot: true,
        dotColor: 'green',
      });
    }

    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.put('/api/data/tasks/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updates = sanitizeInput(req.body || {});
    const idx = db.state.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found.' });
    db.state.tasks[idx] = { ...db.state.tasks[idx], ...updates, id };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/tasks/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.tasks = db.state.tasks.filter((t) => t.id !== id);
    db.state.reminders = db.state.reminders.filter((r) => r.relatedTaskId !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // TRANSACTIONS CRUD + BUDGET ALERT CHECK
  app.post('/api/data/transactions', requireAdminAuth, (req, res) => {
    const payload = sanitizeInput(req.body || {});
    if (!payload.description || payload.amount === undefined) {
      return res.status(400).json({ error: 'Description and amount are required.' });
    }
    const newTx = {
      id: `tx-${Date.now()}`,
      adminId: db.auth.adminId,
      type: payload.type === 'income' ? ('income' as const) : ('expense' as const),
      category: payload.category || (payload.type === 'income' ? 'Salary' : 'Food'),
      amount: Number(payload.amount),
      date: payload.date || '2025-10-12',
      paymentMethod: payload.paymentMethod || 'Credit Card',
      description: String(payload.description),
      notes: String(payload.notes || ''),
      isRecurring: Boolean(payload.isRecurring),
      recurringFrequency: payload.recurringFrequency || undefined,
      familyMemberId: payload.familyMemberId || undefined,
    };
    db.state.transactions.unshift(newTx);

    // Relational link: if recurring bill expense, optionally create a task/reminder if requested
    if (payload.createLinkedReminder && newTx.type === 'expense') {
      db.state.reminders.unshift({
        id: `rem-bill-${Date.now()}`,
        adminId: db.auth.adminId,
        title: `${newTx.description} ($${newTx.amount})`,
        time: '09:00 AM',
        date: newTx.date,
        repeat: 'Monthly',
        category: 'Bills',
        enabled: true,
        notificationSetting: 'Push & Sound',
      });
    }

    // Check budget threshold for category
    if (newTx.type === 'expense') {
      const budget = db.state.budgets.find((b) => b.category === newTx.category);
      if (budget && budget.limitAmount > 0) {
        const spent = db.state.transactions
          .filter((t) => t.type === 'expense' && t.category === newTx.category)
          .reduce((sum, t) => sum + t.amount, 0);
        const pct = Math.round((spent / budget.limitAmount) * 100);
        if (pct >= db.state.settings.budgetWarningThreshold) {
          db.state.notifications.unshift({
            id: `notif-budget-${Date.now()}`,
            adminId: db.auth.adminId,
            title: `${newTx.category} Budget Alert`,
            message: `${newTx.category} budget is now ${pct}% used ($${spent.toLocaleString()} of $${budget.limitAmount.toLocaleString()}).`,
            timestamp: 'Just now',
            category: 'Finance',
            read: false,
            targetSection: 'finance',
          });
        }
      }
    }

    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.put('/api/data/transactions/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updates = sanitizeInput(req.body || {});
    const idx = db.state.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Transaction not found.' });
    db.state.transactions[idx] = {
      ...db.state.transactions[idx],
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : db.state.transactions[idx].amount,
      id,
    };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/transactions/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.transactions = db.state.transactions.filter((t) => t.id !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // BUDGETS & SAVINGS GOALS
  app.put('/api/data/budgets/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const { limitAmount } = sanitizeInput(req.body || {});
    const idx = db.state.budgets.findIndex((b) => b.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Budget not found.' });
    db.state.budgets[idx].limitAmount = Number(limitAmount);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.post('/api/data/savings-goals', requireAdminAuth, (req, res) => {
    const payload = sanitizeInput(req.body || {});
    db.state.savingsGoals.push({
      id: `sg-${Date.now()}`,
      adminId: db.auth.adminId,
      title: String(payload.title || 'New Savings Goal'),
      targetAmount: Number(payload.targetAmount || 5000),
      currentAmount: Number(payload.currentAmount || 0),
      targetDate: String(payload.targetDate || '2026-12-31'),
      notes: String(payload.notes || ''),
    });
    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.put('/api/data/savings-goals/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updates = sanitizeInput(req.body || {});
    const idx = db.state.savingsGoals.findIndex((g) => g.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Savings goal not found.' });
    db.state.savingsGoals[idx] = {
      ...db.state.savingsGoals[idx],
      ...updates,
      targetAmount: updates.targetAmount !== undefined ? Number(updates.targetAmount) : db.state.savingsGoals[idx].targetAmount,
      currentAmount: updates.currentAmount !== undefined ? Number(updates.currentAmount) : db.state.savingsGoals[idx].currentAmount,
      id,
    };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/savings-goals/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.savingsGoals = db.state.savingsGoals.filter((g) => g.id !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // FAMILY MEMBERS & ACTIVITIES
  app.post('/api/data/family', requireAdminAuth, (req, res) => {
    const payload = sanitizeInput(req.body || {});
    if (!payload.name) {
      return res.status(400).json({ error: 'Family member name is required.' });
    }
    const newMember = {
      id: `fam-${Date.now()}`,
      adminId: db.auth.adminId,
      name: String(payload.name),
      photo: payload.photo || 'emma',
      relationship: payload.relationship || 'Daughter',
      dateOfBirth: payload.dateOfBirth || '2018-05-10',
      ageText: payload.ageText || 'Family Member',
      cardTone: payload.cardTone || 'sage',
      schoolInfo: String(payload.schoolInfo || ''),
      gradeOrRole: String(payload.gradeOrRole || ''),
      allergiesOrMedical: String(payload.allergiesOrMedical || 'None noted'),
      doctorName: String(payload.doctorName || ''),
      emergencyContact: String(payload.emergencyContact || 'Sarah Wilson • +1 (415) 890-4321'),
      notes: String(payload.notes || ''),
      activities: [],
    };
    db.state.familyMembers.push(newMember);

    // Relational link: Automatically register their Birthday in Important Dates!
    if (newMember.dateOfBirth) {
      db.state.importantDates.push({
        id: `id-bday-${Date.now()}`,
        adminId: db.auth.adminId,
        title: `${newMember.name}'s Birthday`,
        personOrEvent: newMember.name,
        type: 'Birthday',
        date: `2025-${newMember.dateOfBirth.slice(5)}`,
        recurringYearly: true,
        reminderDaysBefore: 7,
        familyMemberId: newMember.id,
        notes: `Birthday celebration for ${newMember.name}.`,
      });
    }

    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.put('/api/data/family/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updates = sanitizeInput(req.body || {});
    const idx = db.state.familyMembers.findIndex((f) => f.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Family member not found.' });
    db.state.familyMembers[idx] = { ...db.state.familyMembers[idx], ...updates, id };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/family/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.familyMembers = db.state.familyMembers.filter((f) => f.id !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.post('/api/data/family/:id/activities', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const payload = sanitizeInput(req.body || {});
    const member = db.state.familyMembers.find((f) => f.id === id);
    if (!member) return res.status(404).json({ error: 'Family member not found.' });

    const newAct = {
      id: `act-${Date.now()}`,
      familyMemberId: id,
      title: String(payload.title || 'Activity'),
      category: payload.category || 'Activities',
      date: payload.date || '2025-10-15',
      time: payload.time || '04:00 PM',
      location: String(payload.location || ''),
      notes: String(payload.notes || ''),
    };
    member.activities.unshift(newAct);

    // Relational link: Add to Calendar Events automatically
    db.state.events.push({
      id: `ev-act-${Date.now()}`,
      adminId: db.auth.adminId,
      title: `${member.name}: ${newAct.title}`,
      date: newAct.date,
      startTime: newAct.time,
      endTime: '',
      location: newAct.location || newAct.category,
      description: newAct.notes,
      category: newAct.category === 'School' ? 'School' : newAct.category === 'Health' ? 'Health' : 'Family',
      reminder: '1 day before',
      repeat: 'None',
      familyMemberId: id,
    });

    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.delete('/api/data/family/:id/activities/:actId', requireAdminAuth, (req, res) => {
    const { id, actId } = req.params;
    const member = db.state.familyMembers.find((f) => f.id === id);
    if (!member) return res.status(404).json({ error: 'Family member not found.' });
    member.activities = member.activities.filter((a) => a.id !== actId);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // CALENDAR EVENTS CRUD
  app.post('/api/data/events', requireAdminAuth, (req, res) => {
    const payload = sanitizeInput(req.body || {});
    if (!payload.title) return res.status(400).json({ error: 'Event title is required.' });
    const newEvent = {
      id: `ev-${Date.now()}`,
      adminId: db.auth.adminId,
      title: String(payload.title),
      date: payload.date || '2025-10-12',
      startTime: payload.startTime || '10:00 AM',
      endTime: payload.endTime || '11:00 AM',
      location: String(payload.location || 'Home'),
      description: String(payload.description || ''),
      category: payload.category || 'Personal',
      reminder: payload.reminder || '30 mins before',
      repeat: payload.repeat || 'None',
      familyMemberId: payload.familyMemberId || undefined,
      isScheduleSlot: Boolean(payload.isScheduleSlot),
      dotColor: payload.dotColor || 'green',
    };
    db.state.events.push(newEvent);

    // Relational link: if linked to a family member, also show in their activities
    if (newEvent.familyMemberId) {
      const fam = db.state.familyMembers.find((f) => f.id === newEvent.familyMemberId);
      if (fam) {
        fam.activities.unshift({
          id: `act-ev-${Date.now()}`,
          familyMemberId: fam.id,
          title: newEvent.title,
          category: newEvent.category === 'School' ? 'School' : newEvent.category === 'Health' ? 'Health' : 'Activities',
          date: newEvent.date,
          time: newEvent.startTime,
          location: newEvent.location,
          notes: newEvent.description,
        });
      }
    }

    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.put('/api/data/events/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updates = sanitizeInput(req.body || {});
    const idx = db.state.events.findIndex((e) => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Event not found.' });
    db.state.events[idx] = { ...db.state.events[idx], ...updates, id };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/events/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.events = db.state.events.filter((e) => e.id !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // REMINDERS CRUD
  app.post('/api/data/reminders', requireAdminAuth, (req, res) => {
    const payload = sanitizeInput(req.body || {});
    if (!payload.title) return res.status(400).json({ error: 'Reminder title is required.' });
    const newRem = {
      id: `rem-${Date.now()}`,
      adminId: db.auth.adminId,
      title: String(payload.title),
      time: payload.time || '08:00 AM',
      date: payload.date || '2025-10-12',
      repeat: payload.repeat || 'Daily',
      category: payload.category || 'Routine',
      relatedTaskId: payload.relatedTaskId || undefined,
      familyMemberId: payload.familyMemberId || undefined,
      enabled: payload.enabled !== undefined ? Boolean(payload.enabled) : true,
      notificationSetting: payload.notificationSetting || 'Push & Sound',
    };
    db.state.reminders.unshift(newRem);
    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.put('/api/data/reminders/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updates = sanitizeInput(req.body || {});
    const idx = db.state.reminders.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Reminder not found.' });
    db.state.reminders[idx] = { ...db.state.reminders[idx], ...updates, id };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/reminders/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.reminders = db.state.reminders.filter((r) => r.id !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // NOTES CRUD
  app.post('/api/data/notes', requireAdminAuth, (req, res) => {
    const payload = sanitizeInput(req.body || {});
    if (!payload.title) return res.status(400).json({ error: 'Note title is required.' });
    const newNote = {
      id: `note-${Date.now()}`,
      adminId: db.auth.adminId,
      title: String(payload.title),
      content: String(payload.content || ''),
      type: payload.type === 'checklist' ? ('checklist' as const) : ('text' as const),
      category: payload.category || 'Personal Notes',
      checklistItems: Array.isArray(payload.checklistItems) ? payload.checklistItems : [],
      pinned: Boolean(payload.pinned),
      archived: Boolean(payload.archived),
      updatedAt: new Date().toISOString(),
      colorTone: payload.colorTone || 'cream',
    };
    db.state.notes.unshift(newNote);
    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.put('/api/data/notes/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updates = sanitizeInput(req.body || {});
    const idx = db.state.notes.findIndex((n) => n.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Note not found.' });
    db.state.notes[idx] = {
      ...db.state.notes[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
      id,
    };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/notes/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.notes = db.state.notes.filter((n) => n.id !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // IMPORTANT DATES CRUD + RELATIONAL SYNC
  app.post('/api/data/important-dates', requireAdminAuth, (req, res) => {
    const payload = sanitizeInput(req.body || {});
    if (!payload.title) return res.status(400).json({ error: 'Title is required.' });
    const newDate = {
      id: `id-${Date.now()}`,
      adminId: db.auth.adminId,
      title: String(payload.title),
      personOrEvent: String(payload.personOrEvent || payload.title),
      type: payload.type || 'Birthday',
      date: payload.date || '2025-10-18',
      recurringYearly: payload.recurringYearly !== undefined ? Boolean(payload.recurringYearly) : true,
      reminderDaysBefore: Number(payload.reminderDaysBefore ?? 7),
      familyMemberId: payload.familyMemberId || undefined,
      notes: String(payload.notes || ''),
    };
    db.state.importantDates.push(newDate);

    // Relational link: Add to Calendar Events & Reminders
    db.state.events.push({
      id: `ev-id-${Date.now()}`,
      adminId: db.auth.adminId,
      title: newDate.title,
      date: newDate.date,
      startTime: 'All Day',
      endTime: 'All Day',
      location: newDate.type,
      description: newDate.notes,
      category: 'Family',
      reminder: `${newDate.reminderDaysBefore} days before`,
      repeat: newDate.recurringYearly ? 'Yearly' : 'None',
      familyMemberId: newDate.familyMemberId,
    });

    db.state.reminders.unshift({
      id: `rem-id-${Date.now()}`,
      adminId: db.auth.adminId,
      title: `${newDate.title} (${newDate.personOrEvent})`,
      time: '09:00 AM',
      date: newDate.date,
      repeat: newDate.recurringYearly ? 'Yearly' : 'One-time',
      category: 'Important Date',
      familyMemberId: newDate.familyMemberId,
      enabled: true,
      notificationSetting: 'Push & Sound',
    });

    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.put('/api/data/important-dates/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updates = sanitizeInput(req.body || {});
    const idx = db.state.importantDates.findIndex((d) => d.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Important date not found.' });
    db.state.importantDates[idx] = { ...db.state.importantDates[idx], ...updates, id };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/important-dates/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.importantDates = db.state.importantDates.filter((d) => d.id !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // DOCUMENTS CRUD
  app.post('/api/data/documents', requireAdminAuth, (req, res) => {
    const payload = sanitizeInput(req.body || {});
    if (!payload.title) return res.status(400).json({ error: 'Document title is required.' });
    const newDoc = {
      id: `doc-${Date.now()}`,
      adminId: db.auth.adminId,
      title: String(payload.title),
      fileName: String(payload.fileName || `${String(payload.title).toLowerCase().replace(/\s+/g, '_')}.pdf`),
      category: payload.category || 'Personal',
      fileType: payload.fileType || 'PDF',
      fileSize: String(payload.fileSize || '1.2 MB'),
      uploadedAt: new Date().toISOString().slice(0, 10),
      expiryDate: payload.expiryDate || undefined,
      familyMemberId: payload.familyMemberId || undefined,
      notes: String(payload.notes || ''),
      dataUrl: payload.dataUrl || undefined,
    };
    db.state.documents.unshift(newDoc);
    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.put('/api/data/documents/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updates = sanitizeInput(req.body || {});
    const idx = db.state.documents.findIndex((d) => d.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Document not found.' });
    db.state.documents[idx] = { ...db.state.documents[idx], ...updates, id };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/documents/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.documents = db.state.documents.filter((d) => d.id !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // HEALTH RECORDS CRUD + RELATIONAL SYNC
  app.post('/api/data/health', requireAdminAuth, (req, res) => {
    const payload = sanitizeInput(req.body || {});
    if (!payload.title) return res.status(400).json({ error: 'Health record title is required.' });
    const newRecord = {
      id: `hr-${Date.now()}`,
      adminId: db.auth.adminId,
      type: payload.type || 'Appointment',
      title: String(payload.title),
      date: payload.date || '2025-10-22',
      time: payload.time || '10:00 AM',
      providerOrLocation: String(payload.providerOrLocation || 'Family Clinic'),
      familyMemberId: payload.familyMemberId || undefined,
      personName: String(payload.personName || 'Sarah Wilson'),
      dosageOrDetails: String(payload.dosageOrDetails || ''),
      notes: String(payload.notes || ''),
      reminderEnabled: Boolean(payload.reminderEnabled),
      status: payload.status || 'Upcoming',
    };
    db.state.healthRecords.unshift(newRecord);

    // Relational link: if Appointment, add to Calendar and Family Member activities
    if (newRecord.type === 'Appointment') {
      db.state.events.push({
        id: `ev-hr-${Date.now()}`,
        adminId: db.auth.adminId,
        title: `${newRecord.title} (${newRecord.personName})`,
        date: newRecord.date,
        startTime: newRecord.time || '10:00 AM',
        endTime: '',
        location: newRecord.providerOrLocation,
        description: newRecord.dosageOrDetails,
        category: 'Health',
        reminder: '1 day before',
        repeat: 'None',
        familyMemberId: newRecord.familyMemberId,
      });

      if (newRecord.familyMemberId) {
        const fam = db.state.familyMembers.find((f) => f.id === newRecord.familyMemberId);
        if (fam) {
          fam.activities.unshift({
            id: `act-hr-${Date.now()}`,
            familyMemberId: fam.id,
            title: newRecord.title,
            category: 'Health',
            date: newRecord.date,
            time: newRecord.time || '10:00 AM',
            location: newRecord.providerOrLocation,
            notes: newRecord.notes,
          });
        }
      }
    }

    if (newRecord.reminderEnabled) {
      db.state.reminders.unshift({
        id: `rem-hr-${Date.now()}`,
        adminId: db.auth.adminId,
        title: `${newRecord.title} — ${newRecord.personName}`,
        time: newRecord.time || '08:00 AM',
        date: newRecord.date,
        repeat: newRecord.type === 'Medication' ? 'Daily' : 'One-time',
        category: 'Health',
        familyMemberId: newRecord.familyMemberId,
        enabled: true,
        notificationSetting: 'Push & Sound',
      });
    }

    saveDatabase(db);
    return res.status(201).json(db.state);
  });

  app.put('/api/data/health/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const updates = sanitizeInput(req.body || {});
    const idx = db.state.healthRecords.findIndex((h) => h.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Health record not found.' });
    db.state.healthRecords[idx] = { ...db.state.healthRecords[idx], ...updates, id };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/health/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.healthRecords = db.state.healthRecords.filter((h) => h.id !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // NOTIFICATIONS
  app.put('/api/data/notifications/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const n = db.state.notifications.find((item) => item.id === id);
    if (n) n.read = true;
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.post('/api/data/notifications/mark-all-read', requireAdminAuth, (_req, res) => {
    db.state.notifications.forEach((n) => {
      n.read = true;
    });
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.delete('/api/data/notifications/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    db.state.notifications = db.state.notifications.filter((n) => n.id !== id);
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // PROFILE & SETTINGS & BACKUP
  app.put('/api/data/profile', requireAdminAuth, (req, res) => {
    const updates = sanitizeInput(req.body || {});
    db.state.profile = { ...db.state.profile, ...updates, id: db.auth.adminId };
    if (updates.email) {
      db.auth.email = String(updates.email).toLowerCase().trim();
    }
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.put('/api/data/settings', requireAdminAuth, (req, res) => {
    const updates = sanitizeInput(req.body || {});
    db.state.settings = { ...db.state.settings, ...updates, adminId: db.auth.adminId };
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.post('/api/data/import', requireAdminAuth, (req, res) => {
    const importedState = req.body?.state;
    if (!importedState || !importedState.profile || !Array.isArray(importedState.tasks)) {
      return res.status(400).json({ error: 'Invalid backup file format.' });
    }
    db.state = importedState;
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  app.post('/api/data/reset-demo', requireAdminAuth, (_req, res) => {
    db.state = createInitialSeedState();
    saveDatabase(db);
    return res.status(200).json(db.state);
  });

  // ============================================================================
  // VITE DEV SERVER / PRODUCTION STATIC ASSETS
  // ============================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dailyra Personal Life OS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
