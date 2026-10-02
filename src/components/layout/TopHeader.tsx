import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  User,
  Sliders,
  Shield,
  Download,
  LogOut,
  CheckCheck,
  CalendarHeart,
  Crown,
} from 'lucide-react';
import type {
  AdminProfile,
  NotificationItem,
  NavSection,
} from '../../types/dailyra';
import { AvatarImage } from '../ui/CommonUI';

interface TopHeaderProps {
  profile: AdminProfile;
  notifications: NotificationItem[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: (initialQuery?: string) => void;
  onSelectSection: (section: NavSection) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onOpenCustomizeDashboard: () => void;
  onOpenImportantDatesModal: () => void;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profile,
  notifications,
  darkMode,
  onToggleDarkMode,
  onOpenSearch,
  onSelectSection,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onOpenCustomizeDashboard,
  onOpenImportantDatesModal,
  onLogout,
  onOpenMobileMenu,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`h-[72px] px-4 sm:px-7 flex items-center justify-between border-b sticky top-0 z-20 transition-colors ${
        darkMode
          ? 'bg-[#111915]/95 border-[#24332A] text-[#E6ECE8]'
          : 'bg-[#F8F6F1]/95 border-[#EAE5DC] text-[#1F2421]'
      } backdrop-blur-sm`}
    >
      {/* Left Zone: Mobile Hamburger + Global Search Input matching Reference Image */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className={`lg:hidden p-2 rounded-xl border ${
            darkMode
              ? 'border-[#293830] text-[#C4D1C9] hover:bg-[#1C2821]'
              : 'border-[#E5E0D5] text-[#49524C] hover:bg-[#EFECE4]'
          }`}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => onOpenSearch('')}
          className={`w-full max-w-[440px] h-[42px] px-4 rounded-full border flex items-center justify-between text-left transition-all cursor-pointer ${
            darkMode
              ? 'bg-[#18231D] border-[#2A3A30] text-[#8FA195] hover:border-[#3E5848]'
              : 'bg-[#F4F1EA] border-[#E5E0D5] text-[#878F8A] hover:bg-[#FDFCFB] hover:border-[#D5CFC3]'
          }`}
        >
          <span className="flex items-center gap-2.5 truncate text-[13px]">
            <Search className="w-4 h-4 shrink-0 text-[#878F8A]" />
            <span className="truncate">
              Search anything... (tasks, notes, documents, etc.)
            </span>
          </span>
          <kbd
            className={`hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-medium rounded-md border shrink-0 ${
              darkMode
                ? 'bg-[#111915] border-[#2C3E33] text-[#96A79C]'
                : 'bg-[#FDFCFB] border-[#E2DDD2] text-[#7A827D]'
            }`}
          >
            ⌘ K
          </kbd>
        </button>
      </div>

      {/* Right Zone: Notifications, Theme Toggle, Divider, Admin Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Notifications Popover Trigger */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifs((prev) => !prev)}
            className={`relative p-2.5 rounded-full transition-colors cursor-pointer ${
              darkMode
                ? 'text-[#C4D1C9] hover:bg-[#1D2B23]'
                : 'text-[#4B534E] hover:bg-[#EDE9DF]'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-[19px] h-[19px]" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#D9534F] absolute top-2 right-2.5 ring-2 ring-[#F8F6F1]" />
            )}
          </button>

          {showNotifs && (
            <div
              className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-xl overflow-hidden z-40 ${
                darkMode
                  ? 'bg-[#18231D] border-[#2C3E33] text-[#EDF2EE]'
                  : 'bg-[#FDFCFB] border-[#E5E0D5] text-[#1F2421]'
              }`}
            >
              <div
                className={`px-4 py-3.5 border-b flex items-center justify-between ${
                  darkMode ? 'border-[#293830]' : 'border-[#EDE9DF]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[11px] text-[#234732] dark:text-[#8BD4A4] font-medium">
                      · {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllNotificationsRead}
                    className="text-xs text-[#234732] dark:text-[#8BD4A4] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#EDE9DF] dark:divide-[#26352C]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#7A827D]">
                    You are all caught up today.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => {
                        onMarkNotificationRead(notif.id);
                        onSelectSection(notif.targetSection);
                        setShowNotifs(false);
                      }}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 ${
                        !notif.read
                          ? darkMode
                            ? 'bg-[#1E2E25]/70 hover:bg-[#24372C]'
                            : 'bg-[#F5F7F4] hover:bg-[#ECEFE9]'
                          : darkMode
                          ? 'hover:bg-[#1E2B23]'
                          : 'hover:bg-[#F7F5F0]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          !notif.read ? 'bg-[#234732]' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[#878F8A] shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-0.5 leading-snug ${
                            darkMode ? 'text-[#A9B8AF]' : 'text-[#5A625D]'
                          }`}
                        >
                          {notif.message}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Light / Dark Theme Toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            darkMode
              ? 'text-[#E5C07B] hover:bg-[#1D2B23]'
              : 'text-[#4B534E] hover:bg-[#EDE9DF]'
          }`}
          aria-label="Toggle appearance mode"
          title={darkMode ? 'Switch to Warm Light Mode' : 'Switch to Forest Dark Mode'}
        >
          {darkMode ? (
            <Moon className="w-[19px] h-[19px]" />
          ) : (
            <Sun className="w-[19px] h-[19px]" />
          )}
        </button>

        {/* Subtle Vertical Divider */}
        <div
          className={`h-7 w-[1px] hidden sm:block ${
            darkMode ? 'bg-[#28382E]' : 'bg-[#E2DDD2]'
          }`}
        />

        {/* Admin Profile & Dropdown */}
        <div className="relative" ref={accountRef}>
          <button
            type="button"
            onClick={() => setShowAccountMenu((prev) => !prev)}
            className={`flex items-center gap-3 py-1 px-2 rounded-full transition-colors cursor-pointer ${
              darkMode ? 'hover:bg-[#1C2821]' : 'hover:bg-[#EFECE4]'
            }`}
          >
            <AvatarImage
              photoKey={profile.avatar}
              name={profile.name}
              className="w-10 h-10 rounded-full ring-2 ring-[#E5E0D5]"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13.5px] font-semibold leading-tight">
                {profile.name}
              </span>
              <span className="text-[11px] text-[#8E7955] font-medium flex items-center gap-1 mt-0.5">
                <span>{profile.planLabel || 'Premium'}</span>
                <Crown className="w-3 h-3 text-[#D4A24C] fill-[#D4A24C]" />
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#7A827D] hidden sm:block ml-0.5" />
          </button>

          {showAccountMenu && (
            <div
              className={`absolute right-0 mt-2 w-60 rounded-2xl border shadow-xl py-2 z-40 ${
                darkMode
                  ? 'bg-[#18231D] border-[#2C3E33] text-[#EDF2EE]'
                  : 'bg-[#FDFCFB] border-[#E5E0D5] text-[#1F2421]'
              }`}
            >
              <div
                className={`px-4 py-2.5 border-b mb-1 ${
                  darkMode ? 'border-[#293830]' : 'border-[#EDE9DF]'
                }`}
              >
                <p className="text-xs font-semibold">{profile.name}</p>
                <p className="text-[11px] text-[#7A827D] truncate">{profile.email}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectSection('settings');
                  setShowAccountMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
              >
                <User className="w-4 h-4 text-[#234732] dark:text-[#8BD4A4]" />
                <span>Admin Profile & Preferences</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenImportantDatesModal();
                  setShowAccountMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
              >
                <CalendarHeart className="w-4 h-4 text-[#234732] dark:text-[#8BD4A4]" />
                <span>Important Dates & Birthdays</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenCustomizeDashboard();
                  setShowAccountMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
              >
                <Sliders className="w-4 h-4 text-[#234732] dark:text-[#8BD4A4]" />
                <span>Personalize Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectSection('settings');
                  setShowAccountMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
              >
                <Shield className="w-4 h-4 text-[#234732] dark:text-[#8BD4A4]" />
                <span>Security & Backup</span>
              </button>

              <div
                className={`my-1 border-t ${
                  darkMode ? 'border-[#293830]' : 'border-[#EDE9DF]'
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  onLogout();
                }}
                className="w-full px-4 py-2 text-left text-xs flex items-center gap-2.5 text-[#B84A4A] hover:bg-[#FDF2F2] dark:hover:bg-[#2D1E1E]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Dailyra</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
