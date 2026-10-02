import React, { useState } from 'react';
import {
  User,
  Palette,
  Bell,
  Shield,
  Lock,
  Database,
  Download,
  Upload,
  RotateCcw,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import type { DailyraState } from '../../types/dailyra';
import { AvatarImage } from '../ui/CommonUI';
import { dailyraApi } from '../../services/api';

interface SettingsPageProps {
  state: DailyraState;
  darkMode: boolean;
  onUpdateProfile: (updates: Record<string, unknown>) => Promise<void>;
  onUpdateSettings: (updates: Record<string, unknown>) => Promise<void>;
  onImportBackup: (imported: DailyraState) => Promise<void>;
  onResetDemo: () => Promise<void>;
  onLogout: () => void;
  onNotify: (msg: string) => void;
}

type SettingsTab =
  | 'Profile'
  | 'Appearance'
  | 'Notifications'
  | 'Security'
  | 'Privacy'
  | 'Backup & Data';

export const SettingsPage: React.FC<SettingsPageProps> = ({
  state,
  darkMode,
  onUpdateProfile,
  onUpdateSettings,
  onImportBackup,
  onResetDemo,
  onLogout,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');

  // Profile fields
  const [name, setName] = useState(state.profile.name);
  const [firstName, setFirstName] = useState(state.profile.firstName);
  const [email, setEmail] = useState(state.profile.email);
  const [phone, setPhone] = useState(state.profile.phone);
  const [dateOfBirth, setDateOfBirth] = useState(state.profile.dateOfBirth);
  const [preferredCurrency, setPreferredCurrency] = useState(
    state.profile.preferredCurrency
  );
  const [timezone, setTimezone] = useState(state.profile.timezone);
  const [country, setCountry] = useState(state.profile.country);
  const [motivationalQuote, setMotivationalQuote] = useState(
    state.profile.motivationalQuote
  );
  const [sidebarQuote, setSidebarQuote] = useState(state.profile.sidebarQuote);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  const handleExportBackup = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(state, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `dailyra_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onNotify('Personal data backup exported.');
  };

  const cardSurface = darkMode
    ? 'bg-[#18231D] border-[#28382E] text-[#EDF2EE]'
    : 'bg-[#FDFCFB] border-[#EAE5DC] text-[#1F2421]';

  const inputClass = `w-full px-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-none ${
    darkMode
      ? 'bg-[#121B16] border-[#2C3E33] text-[#EDF2EE]'
      : 'bg-[#F8F6F1] border-[#E2DDD2] text-[#1F2421]'
  }`;

  return (
    <div className="px-4 sm:px-7 py-6 max-w-[1320px] mx-auto space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Settings & Administrator Control
        </h1>
        <p className="text-xs text-[#6E7671] mt-1">
          Manage your personal profile, appearance theme, security keys, privacy preferences, and encrypted backups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Column */}
        <div className={`${cardSurface} lg:col-span-3 rounded-2xl border p-3 space-y-1`}>
          {(
            [
              { id: 'Profile', icon: User },
              { id: 'Appearance', icon: Palette },
              { id: 'Notifications', icon: Bell },
              { id: 'Security', icon: Shield },
              { id: 'Privacy', icon: Lock },
              { id: 'Backup & Data', icon: Database },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#E4E9E1] dark:bg-[#23362B] text-[#1E3F2B] dark:text-white font-semibold'
                    : 'text-[#5A625D] hover:bg-[#F2EFE9] dark:text-[#A9B8AF]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.id}</span>
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-[#EDE9DF] dark:border-[#28382E]">
            <button
              type="button"
              onClick={onLogout}
              className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-medium flex items-center gap-3 text-[#B84A4A] hover:bg-[#FDF2F2] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className={`${cardSurface} lg:col-span-9 rounded-2xl border p-6`}>
          {activeTab === 'Profile' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await onUpdateProfile({
                  name,
                  firstName,
                  email,
                  phone,
                  dateOfBirth,
                  preferredCurrency,
                  currencySymbol:
                    preferredCurrency === 'EUR'
                      ? '€'
                      : preferredCurrency === 'GBP'
                      ? '£'
                      : '$',
                  timezone,
                  country,
                  motivationalQuote,
                  sidebarQuote,
                });
              }}
              className="space-y-5"
            >
              <div className="flex items-center gap-4 pb-4 border-b border-[#EDE9DF] dark:border-[#28382E]">
                <AvatarImage
                  photoKey={state.profile.avatar}
                  name={state.profile.name}
                  className="w-16 h-16 rounded-full ring-2 ring-[#E5E0D5]"
                />
                <div>
                  <h2 className="font-serif-display text-2xl font-semibold">
                    {state.profile.name}
                  </h2>
                  <p className="text-xs text-[#6E7671]">
                    Sole Owner & Administrator · {state.profile.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Greeting First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Admin Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Preferred Currency
                  </label>
                  <select
                    value={preferredCurrency}
                    onChange={(e) => setPreferredCurrency(e.target.value)}
                    className={inputClass}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Banner Handwritten Quote
                  </label>
                  <input
                    type="text"
                    value={motivationalQuote}
                    onChange={(e) => setMotivationalQuote(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Sidebar Footer Quote
                  </label>
                  <input
                    type="text"
                    value={sidebarQuote}
                    onChange={(e) => setSidebarQuote(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#234732] hover:bg-[#1B3727] text-white text-xs font-medium cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'Appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold">Theme & Visual Atmosphere</h2>
                <p className="text-xs text-[#7A827D] mt-0.5">
                  Choose between Dailyra’s signature Warm Ivory palette or Deep Forest Dark mode.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['light', 'dark', 'system'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onUpdateSettings({ appearance: mode })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      state.settings.appearance === mode
                        ? 'border-[#234732] ring-2 ring-[#234732]/30'
                        : 'border-[#E2DDD2] dark:border-[#28382E]'
                    }`}
                  >
                    <p className="text-xs font-semibold capitalize">{mode} Mode</p>
                    <p className="text-[11px] text-[#7A827D] mt-1">
                      {mode === 'light'
                        ? 'Warm cream & deep forest green (Default)'
                        : mode === 'dark'
                        ? 'Calm nocturnal forest slate'
                        : 'Match operating system'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold">Notification Preferences</h2>
              {[
                {
                  key: 'billAlerts',
                  label: 'Recurring Bill & Due Date Alerts',
                  val: state.settings.billAlerts,
                },
                {
                  key: 'birthdayReminders',
                  label: 'Family Birthday & Milestone Reminders',
                  val: state.settings.birthdayReminders,
                },
                {
                  key: 'emailNotifications',
                  label: 'Daily Morning Digest Summary',
                  val: state.settings.emailNotifications,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-4 rounded-xl border border-[#EAE5DC] dark:border-[#28382E] flex items-center justify-between"
                >
                  <span className="text-xs font-medium">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.val}
                    onChange={(e) =>
                      onUpdateSettings({ [item.key]: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#234732]"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold">
                  Administrator Password & Session Security
                </h2>
                <p className="text-xs text-[#7A827D]">
                  Update your encrypted administrator password (`scrypt` hashed server-side).
                </p>
              </div>

              {pwMsg && (
                <div className="p-3 rounded-xl bg-[#EAF4EC] text-[#1E3F2B] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{pwMsg}</span>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPwMsg(null);
                  try {
                    await dailyraApi.changePassword(currentPassword, newPassword);
                    setCurrentPassword('');
                    setNewPassword('');
                    setPwMsg('Administrator password updated successfully.');
                    onNotify('Password updated.');
                  } catch (err: any) {
                    setPwMsg(err.message || 'Failed to update password.');
                  }
                }}
                className="space-y-3.5 max-w-md"
              >
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    New Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#234732] text-white text-xs font-medium"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'Privacy' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold">Privacy & Data Ownership</h2>
              <div className="p-4 rounded-xl border border-[#EAE5DC] dark:border-[#28382E] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">
                    Mask Financial Balances by Default
                  </p>
                  <p className="text-[11px] text-[#7A827D]">
                    Hide dollar amounts on the Home Dashboard until you click the eye icon.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={state.settings.hideBalanceByDefault}
                  onChange={(e) =>
                    onUpdateSettings({ hideBalanceByDefault: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#234732]"
                />
              </div>
              <div className="p-4 rounded-xl bg-[#FAF8F4] dark:bg-[#131C17] border border-[#EAE5DC] dark:border-[#28382E] text-xs text-[#5A625D] dark:text-[#A9B8AF] leading-relaxed">
                Dailyra operates strictly as a single-owner private instance. There are no public endpoints, third-party trackers, or shared workspaces. All records belong exclusively to your administrator account.
              </div>
            </div>
          )}

          {activeTab === 'Backup & Data' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold">
                  Personal Data Export, Backup & Restore
                </h2>
                <p className="text-xs text-[#7A827D] mt-0.5">
                  Export your entire Personal Life OS database as a portable JSON file or restore from a backup.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="p-4 rounded-2xl border border-[#E2DDD2] dark:border-[#28382E] hover:border-[#234732] text-left space-y-2 cursor-pointer"
                >
                  <Download className="w-5 h-5 text-[#234732]" />
                  <p className="text-xs font-semibold">Export Full Backup</p>
                  <p className="text-[11px] text-[#7A827D]">
                    Download all tasks, finances, family, notes, and documents as JSON.
                  </p>
                </button>

                <label className="p-4 rounded-2xl border border-[#E2DDD2] dark:border-[#28382E] hover:border-[#234732] text-left space-y-2 cursor-pointer block">
                  <Upload className="w-5 h-5 text-[#234732]" />
                  <p className="text-xs font-semibold">Import & Restore JSON</p>
                  <p className="text-[11px] text-[#7A827D]">
                    Restore your Dailyra life state from a saved backup file.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async () => {
                        try {
                          const parsed = JSON.parse(String(reader.result));
                          await onImportBackup(parsed);
                        } catch {
                          onNotify('Invalid JSON backup file.');
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={onResetDemo}
                  className="p-4 rounded-2xl border border-[#E2DDD2] dark:border-[#28382E] hover:border-[#B84A4A] text-left space-y-2 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5 text-[#B84A4A]" />
                  <p className="text-xs font-semibold">Reset Sample Data</p>
                  <p className="text-[11px] text-[#7A827D]">
                    Restore initial Sarah Wilson sample state.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
