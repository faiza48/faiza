import React, { useState, useEffect, useCallback } from 'react';
import type { DailyraState, NavSection } from './types/dailyra';
import { dailyraApi } from './services/api';
import { LoginScreen } from './components/auth/LoginScreen';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { HomeDashboard } from './components/pages/HomeDashboard';
import { TasksPage } from './components/pages/TasksPage';
import { FinancePage } from './components/pages/FinancePage';
import { FamilyPage } from './components/pages/FamilyPage';
import { CalendarPage } from './components/pages/CalendarPage';
import { RemindersPage } from './components/pages/RemindersPage';
import { NotesPage } from './components/pages/NotesPage';
import { DocumentsPage } from './components/pages/DocumentsPage';
import { HealthPage } from './components/pages/HealthPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import {
  QuickActionModals,
  type QuickActionType,
} from './components/modals/QuickActionModals';
import {
  ToastContainer,
  SkeletonDashboard,
  type ToastMessage,
} from './components/ui/CommonUI';

export default function App() {
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmailHint, setAdminEmailHint] = useState('girlsigma611@gmail.com');
  const [state, setState] = useState<DailyraState | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Navigation & UI state
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [subFilter, setSubFilter] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeQuickModal, setActiveQuickModal] = useState<QuickActionType>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadAuthenticatedState = useCallback(async () => {
    setLoadingData(true);
    try {
      const data = await dailyraApi.getState();
      setState(data);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Failed to load authenticated state:', err);
      setIsAuthenticated(false);
      setState(null);
      throw err;
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = await dailyraApi.checkSession();
        if (!mounted) return;
        if (session.adminEmailHint) {
          setAdminEmailHint(session.adminEmailHint);
        }
        if (session.authenticated) {
          await loadAuthenticatedState();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        if (mounted) setIsAuthenticated(false);
      } finally {
        if (mounted) setAuthChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadAuthenticatedState]);

  // Global Cmd+K / Ctrl+K shortcut for instant search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (isAuthenticated) {
          e.preventDefault();
          setSearchOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  const handleNavigate = (section: NavSection, filter?: string) => {
    setActiveSection(section);
    setSubFilter(filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await dailyraApi.logout();
    } finally {
      setIsAuthenticated(false);
      setState(null);
      setActiveSection('home');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center">
        <div className="w-full max-w-6xl">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !state) {
    return (
      <LoginScreen
        defaultEmailHint={adminEmailHint}
        onLoginSuccess={loadAuthenticatedState}
      />
    );
  }

  const darkMode = state.settings.appearance === 'dark';

  return (
    <div
      className={`min-h-screen flex transition-colors ${
        darkMode
          ? 'bg-[#111915] text-[#EDF2EE]'
          : 'bg-[#F6F4EE] text-[#1F2421]'
      }`}
    >
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(sec) => handleNavigate(sec)}
        sidebarQuote={state.profile.sidebarQuote}
        darkMode={darkMode}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          profile={state.profile}
          notifications={state.notifications}
          darkMode={darkMode}
          onToggleDarkMode={async () => {
            const nextMode = darkMode ? 'light' : 'dark';
            const updated = await dailyraApi.updateSettings({
              appearance: nextMode,
            });
            setState(updated);
          }}
          onOpenSearch={() => setSearchOpen(true)}
          onSelectSection={(sec) => handleNavigate(sec)}
          onMarkNotificationRead={async (id) => {
            const updated = await dailyraApi.markNotificationRead(id);
            setState(updated);
          }}
          onMarkAllNotificationsRead={async () => {
            const updated = await dailyraApi.markAllNotificationsRead();
            setState(updated);
            addToast('All notifications marked as read.');
          }}
          onOpenCustomizeDashboard={() =>
            setActiveQuickModal('customize-dashboard')
          }
          onOpenImportantDatesModal={() =>
            setActiveQuickModal('important-dates')
          }
          onLogout={handleLogout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 pb-12">
          {loadingData ? (
            <SkeletonDashboard darkMode={darkMode} />
          ) : (
            <>
              {activeSection === 'home' && (
                <HomeDashboard
                  state={state}
                  darkMode={darkMode}
                  onNavigate={handleNavigate}
                  onOpenQuickAction={(action) => setActiveQuickModal(action)}
                  onToggleNoteChecklistItem={async (noteId, itemId) => {
                    const targetNote = state.notes.find((n) => n.id === noteId);
                    if (!targetNote) return;
                    const updatedItems = targetNote.checklistItems.map((c) =>
                      c.id === itemId ? { ...c, completed: !c.completed } : c
                    );
                    const updated = await dailyraApi.updateNote(noteId, {
                      checklistItems: updatedItems,
                    });
                    setState(updated);
                    addToast('Checklist updated.');
                  }}
                  onToggleTaskStatus={async (taskId) => {
                    const target = state.tasks.find((t) => t.id === taskId);
                    if (!target) return;
                    const nextStatus =
                      target.status === 'Completed' ? 'Pending' : 'Completed';
                    const updated = await dailyraApi.updateTask(taskId, {
                      status: nextStatus,
                    });
                    setState(updated);
                    addToast(`Task marked as ${nextStatus.toLowerCase()}.`);
                  }}
                />
              )}

              {activeSection === 'tasks' && (
                <TasksPage
                  state={state}
                  darkMode={darkMode}
                  onCreateTask={async (payload) => {
                    const updated = await dailyraApi.createTask(payload);
                    setState(updated);
                    addToast('Task added successfully.');
                  }}
                  onUpdateTask={async (id, updates) => {
                    const updated = await dailyraApi.updateTask(id, updates);
                    setState(updated);
                    addToast('Task updated.');
                  }}
                  onDeleteTask={async (id) => {
                    const updated = await dailyraApi.deleteTask(id);
                    setState(updated);
                    addToast('Task deleted.');
                  }}
                />
              )}

              {activeSection === 'finance' && (
                <FinancePage
                  state={state}
                  darkMode={darkMode}
                  onCreateTransaction={async (payload) => {
                    const updated = await dailyraApi.createTransaction(payload);
                    setState(updated);
                    addToast(
                      payload.type === 'income'
                        ? 'Income recorded.'
                        : 'Expense saved.'
                    );
                  }}
                  onUpdateTransaction={async (id, updates) => {
                    const updated = await dailyraApi.updateTransaction(
                      id,
                      updates
                    );
                    setState(updated);
                    addToast('Transaction updated.');
                  }}
                  onDeleteTransaction={async (id) => {
                    const updated = await dailyraApi.deleteTransaction(id);
                    setState(updated);
                    addToast('Transaction removed.');
                  }}
                  onUpdateBudget={async (id, limitAmount) => {
                    const updated = await dailyraApi.updateBudget(
                      id,
                      limitAmount
                    );
                    setState(updated);
                    addToast('Monthly budget updated.');
                  }}
                  onCreateSavingsGoal={async (payload) => {
                    const updated = await dailyraApi.createSavingsGoal(payload);
                    setState(updated);
                    addToast('Savings goal created.');
                  }}
                  onUpdateSavingsGoal={async (id, updates) => {
                    const updated = await dailyraApi.updateSavingsGoal(
                      id,
                      updates
                    );
                    setState(updated);
                    addToast('Savings goal progress updated.');
                  }}
                  onDeleteSavingsGoal={async (id) => {
                    const updated = await dailyraApi.deleteSavingsGoal(id);
                    setState(updated);
                    addToast('Savings goal deleted.');
                  }}
                />
              )}

              {activeSection === 'family' && (
                <FamilyPage
                  state={state}
                  darkMode={darkMode}
                  initialSubFilter={subFilter}
                  onNavigate={(sec) => handleNavigate(sec)}
                  onCreateFamilyMember={async (payload) => {
                    const updated = await dailyraApi.createFamilyMember(payload);
                    setState(updated);
                    addToast('Family member added.');
                  }}
                  onUpdateFamilyMember={async (id, updates) => {
                    const updated = await dailyraApi.updateFamilyMember(
                      id,
                      updates
                    );
                    setState(updated);
                    addToast('Family profile updated.');
                  }}
                  onDeleteFamilyMember={async (id) => {
                    const updated = await dailyraApi.deleteFamilyMember(id);
                    setState(updated);
                    addToast('Family member removed.');
                  }}
                  onAddFamilyActivity={async (memberId, activity) => {
                    const updated = await dailyraApi.addFamilyActivity(
                      memberId,
                      activity
                    );
                    setState(updated);
                    addToast('Activity added & synced to Calendar.');
                  }}
                  onDeleteFamilyActivity={async (memberId, actId) => {
                    const updated = await dailyraApi.deleteFamilyActivity(
                      memberId,
                      actId
                    );
                    setState(updated);
                    addToast('Activity removed.');
                  }}
                  onCreateImportantDate={async (payload) => {
                    const updated = await dailyraApi.createImportantDate(payload);
                    setState(updated);
                    addToast('Important date added.');
                  }}
                  onDeleteImportantDate={async (id) => {
                    const updated = await dailyraApi.deleteImportantDate(id);
                    setState(updated);
                    addToast('Important date deleted.');
                  }}
                />
              )}

              {activeSection === 'calendar' && (
                <CalendarPage
                  state={state}
                  darkMode={darkMode}
                  onCreateEvent={async (payload) => {
                    const updated = await dailyraApi.createEvent(payload);
                    setState(updated);
                    addToast('Calendar event scheduled.');
                  }}
                  onUpdateEvent={async (id, updates) => {
                    const updated = await dailyraApi.updateEvent(id, updates);
                    setState(updated);
                    addToast('Event updated.');
                  }}
                  onDeleteEvent={async (id) => {
                    const updated = await dailyraApi.deleteEvent(id);
                    setState(updated);
                    addToast('Event deleted.');
                  }}
                />
              )}

              {activeSection === 'reminders' && (
                <RemindersPage
                  state={state}
                  darkMode={darkMode}
                  onCreateReminder={async (payload) => {
                    const updated = await dailyraApi.createReminder(payload);
                    setState(updated);
                    addToast('Reminder created.');
                  }}
                  onUpdateReminder={async (id, updates) => {
                    const updated = await dailyraApi.updateReminder(id, updates);
                    setState(updated);
                    addToast('Reminder updated.');
                  }}
                  onDeleteReminder={async (id) => {
                    const updated = await dailyraApi.deleteReminder(id);
                    setState(updated);
                    addToast('Reminder deleted.');
                  }}
                />
              )}

              {activeSection === 'notes' && (
                <NotesPage
                  state={state}
                  darkMode={darkMode}
                  onCreateNote={async (payload) => {
                    const updated = await dailyraApi.createNote(payload);
                    setState(updated);
                    addToast('Note created.');
                  }}
                  onUpdateNote={async (id, updates) => {
                    const updated = await dailyraApi.updateNote(id, updates);
                    setState(updated);
                    addToast('Note updated.');
                  }}
                  onDeleteNote={async (id) => {
                    const updated = await dailyraApi.deleteNote(id);
                    setState(updated);
                    addToast('Note deleted.');
                  }}
                />
              )}

              {activeSection === 'documents' && (
                <DocumentsPage
                  state={state}
                  darkMode={darkMode}
                  onCreateDocument={async (payload) => {
                    const updated = await dailyraApi.createDocument(payload);
                    setState(updated);
                    addToast('Document securely stored in vault.');
                  }}
                  onUpdateDocument={async (id, updates) => {
                    const updated = await dailyraApi.updateDocument(id, updates);
                    setState(updated);
                    addToast('Document updated.');
                  }}
                  onDeleteDocument={async (id) => {
                    const updated = await dailyraApi.deleteDocument(id);
                    setState(updated);
                    addToast('Document deleted from vault.');
                  }}
                />
              )}

              {activeSection === 'health' && (
                <HealthPage
                  state={state}
                  darkMode={darkMode}
                  onCreateHealthRecord={async (payload) => {
                    const updated = await dailyraApi.createHealthRecord(payload);
                    setState(updated);
                    addToast('Health record saved.');
                  }}
                  onUpdateHealthRecord={async (id, updates) => {
                    const updated = await dailyraApi.updateHealthRecord(
                      id,
                      updates
                    );
                    setState(updated);
                    addToast('Health record updated.');
                  }}
                  onDeleteHealthRecord={async (id) => {
                    const updated = await dailyraApi.deleteHealthRecord(id);
                    setState(updated);
                    addToast('Health record deleted.');
                  }}
                />
              )}

              {activeSection === 'settings' && (
                <SettingsPage
                  state={state}
                  darkMode={darkMode}
                  onUpdateProfile={async (updates) => {
                    const updated = await dailyraApi.updateProfile(updates);
                    setState(updated);
                    addToast('Admin profile saved.');
                  }}
                  onUpdateSettings={async (updates) => {
                    const updated = await dailyraApi.updateSettings(updates);
                    setState(updated);
                    addToast('Settings updated.');
                  }}
                  onImportBackup={async (imported) => {
                    const updated = await dailyraApi.importBackup(imported);
                    setState(updated);
                    addToast('Personal life backup restored.');
                  }}
                  onResetDemo={async () => {
                    const updated = await dailyraApi.resetDemoData();
                    setState(updated);
                    addToast('Sample data restored.');
                  }}
                  onLogout={handleLogout}
                  onNotify={addToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Search Modal (Cmd+K / Ctrl+K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        state={state}
        onNavigate={(sec) => handleNavigate(sec)}
        darkMode={darkMode}
      />

      {/* Quick Actions & Personalization Modals */}
      <QuickActionModals
        activeModal={activeQuickModal}
        onClose={() => setActiveQuickModal(null)}
        state={state}
        darkMode={darkMode}
        onCreateTask={async (payload) => {
          const updated = await dailyraApi.createTask(payload);
          setState(updated);
          addToast('Task added successfully.');
        }}
        onCreateTransaction={async (payload) => {
          const updated = await dailyraApi.createTransaction(payload);
          setState(updated);
          addToast(
            payload.type === 'income' ? 'Income recorded.' : 'Expense saved.'
          );
        }}
        onCreateEvent={async (payload) => {
          const updated = await dailyraApi.createEvent(payload);
          setState(updated);
          addToast('Calendar event added.');
        }}
        onCreateReminder={async (payload) => {
          const updated = await dailyraApi.createReminder(payload);
          setState(updated);
          addToast('Reminder created.');
        }}
        onCreateNote={async (payload) => {
          const updated = await dailyraApi.createNote(payload);
          setState(updated);
          addToast('Note saved.');
        }}
        onCreateFamilyMember={async (payload) => {
          const updated = await dailyraApi.createFamilyMember(payload);
          setState(updated);
          addToast('Family member added.');
        }}
        onCreateDocument={async (payload) => {
          const updated = await dailyraApi.createDocument(payload);
          setState(updated);
          addToast('Document uploaded to vault.');
        }}
        onCreateImportantDate={async (payload) => {
          const updated = await dailyraApi.createImportantDate(payload);
          setState(updated);
          addToast('Important milestone added.');
        }}
        onDeleteImportantDate={async (id) => {
          const updated = await dailyraApi.deleteImportantDate(id);
          setState(updated);
          addToast('Important date removed.');
        }}
        onUpdateSettings={async (updates) => {
          const updated = await dailyraApi.updateSettings(updates);
          setState(updated);
          addToast('Dashboard preferences saved.');
        }}
      />

      {/* Subtle Dailyra Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
