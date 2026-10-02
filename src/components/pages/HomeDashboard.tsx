import React, { useState, useMemo } from 'react';
import {
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Utensils,
  Briefcase,
  Users,
  Car,
  Dumbbell,
  Home as HomeIcon,
  ShoppingBag,
  Landmark,
  Bell,
  Pill,
  GraduationCap,
  Shapes,
  Heart,
  CheckSquare,
  Calendar as CalendarIcon,
  FileText,
  Coins,
  Cake,
  Stethoscope,
  AlarmClock,
  Moon,
  FolderPlus,
  UserPlus,
  SlidersHorizontal,
} from 'lucide-react';
import type { DailyraState, NavSection } from '../../types/dailyra';
import type { QuickActionType } from '../modals/QuickActionModals';
import { VISUAL_ASSETS } from '../../assets/visualAssets';
import { AvatarImage } from '../ui/CommonUI';

interface HomeDashboardProps {
  state: DailyraState;
  darkMode: boolean;
  onNavigate: (section: NavSection, subFilter?: string) => void;
  onOpenQuickAction: (action: QuickActionType) => void;
  onToggleNoteChecklistItem: (noteId: string, itemId: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  state,
  darkMode,
  onNavigate,
  onOpenQuickAction,
  onToggleNoteChecklistItem,
}) => {
  const [hideBalance, setHideBalance] = useState(
    state.settings.hideBalanceByDefault
  );
  const [financePeriod, setFinancePeriod] = useState<'month' | 'last_month' | 'year'>('month');
  const [selectedCalDay, setSelectedCalDay] = useState<number>(13);
  const [greetingPeriod, setGreetingPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const isWidgetVisible = (id: string) => {
    const found = state.settings.dashboardWidgets.find((w) => w.id === id);
    return found ? found.visible : true;
  };

  // Dynamic Calculations from Stored State
  const remainingTasks = useMemo(
    () => state.tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress'),
    [state.tasks]
  );

  const monthlyIncome = useMemo(() => {
    const base = state.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    if (financePeriod === 'last_month') return Math.round(base * 0.89);
    if (financePeriod === 'year') return base * 10;
    return base;
  }, [state.transactions, financePeriod]);

  const monthlyExpenses = useMemo(() => {
    const base = state.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    if (financePeriod === 'last_month') return Math.round(base * 0.92);
    if (financePeriod === 'year') return base * 10;
    return base;
  }, [state.transactions, financePeriod]);

  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const totalBalance = 9780 + monthlySavings; // Starts at $12,450 when income=$4,800 & expenses=$2,130

  // Spending Breakdown Donut Data
  const spendingBreakdown = useMemo(() => {
    const expenses = state.transactions.filter((t) => t.type === 'expense');
    const total = expenses.reduce((s, t) => s + t.amount, 0) || 1;
    const byCat: Record<string, number> = {};
    expenses.forEach((t) => {
      byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    });

    const food = Math.round(((byCat['Food'] || 0) / total) * 100);
    const home = Math.round(((byCat['Home'] || 0) / total) * 100);
    const transport = Math.round(((byCat['Transport'] || 0) / total) * 100);
    const family = Math.round(((byCat['Family'] || 0) / total) * 100);
    const shopping = Math.round(((byCat['Shopping'] || 0) / total) * 100);
    const others = Math.max(0, 100 - (food + home + transport + family + shopping));

    return [
      { label: 'Food', pct: food, color: '#38664B' },
      { label: 'Home', pct: home, color: '#E8B96B' },
      { label: 'Transport', pct: transport, color: '#58999E' },
      { label: 'Family', pct: family, color: '#E08B6B' },
      { label: 'Shopping', pct: shopping, color: '#5E9AD9' },
      { label: 'Others', pct: others, color: '#8C7AE6' },
    ];
  }, [state.transactions]);

  const scheduleEvents = useMemo(
    () => state.events.filter((e) => e.isScheduleSlot).slice(0, 6),
    [state.events]
  );

  const upcomingEvents = useMemo(
    () => state.events.filter((e) => !e.isScheduleSlot || e.title.includes('Pick up Emma')).slice(0, 4),
    [state.events]
  );

  const shoppingNote = useMemo(
    () => state.notes.find((n) => n.type === 'checklist') || state.notes[0],
    [state.notes]
  );

  const otherQuickNotes = useMemo(
    () => state.notes.filter((n) => n.id !== shoppingNote?.id && !n.archived).slice(0, 2),
    [state.notes, shoppingNote]
  );

  const cardSurface = darkMode
    ? 'bg-[#18231D] border-[#28382E] text-[#EDF2EE]'
    : 'bg-[#FDFCFB] border-[#EAE5DC] text-[#1F2421] shadow-[0_2px_12px_-4px_rgba(31,58,43,0.05)]';

  const getScheduleIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('breakfast') || lower.includes('dinner')) return Utensils;
    if (lower.includes('work')) return Briefcase;
    if (lower.includes('lunch') || lower.includes('amina')) return Users;
    if (lower.includes('pick up') || lower.includes('school')) return Car;
    if (lower.includes('gym') || lower.includes('fitness')) return Dumbbell;
    return HomeIcon;
  };

  const getDotColorClass = (dot?: string) => {
    switch (dot) {
      case 'coral':
        return 'bg-[#E06D60]';
      case 'purple':
        return 'bg-[#8D72E1]';
      case 'amber':
        return 'bg-[#E59A46]';
      case 'blue':
        return 'bg-[#5B8FD9]';
      default:
        return 'bg-[#2E6F48]';
    }
  };

  // SVG Donut Helper
  const renderDonutSegments = () => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let cumulativePct = 0;

    return spendingBreakdown.map((item) => {
      const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulativePct / 100) * circumference);
      cumulativePct += item.pct;
      return (
        <circle
          key={item.label}
          cx="54"
          cy="54"
          r={radius}
          fill="transparent"
          stroke={item.color}
          strokeWidth="15"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300"
        />
      );
    });
  };

  return (
    <div className="px-4 sm:px-7 py-5 max-w-[1600px] mx-auto space-y-5">
      {/* =====================================================================
          1. TOP HERO GREETING BANNER (Matches Reference Image 1:1)
      ===================================================================== */}
      <section
        className={`relative rounded-2xl overflow-hidden border min-h-[132px] flex items-center justify-between px-6 sm:px-8 py-5 ${
          darkMode
            ? 'bg-[#17231C] border-[#28382E]'
            : 'bg-[#F4F1EA] border-[#E8E3D9]'
        }`}
      >
        {/* Right-side Atmospheric Mountain Landscape Image with Seamless Gradient Fade */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src={VISUAL_ASSETS.heroMountainBanner}
            alt="Misty green valley morning backdrop"
            referrerPolicy="no-referrer"
            className="w-full sm:w-[74%] h-full object-cover object-right ml-auto opacity-95"
          />
          <div
            className={`absolute inset-0 ${
              darkMode
                ? 'bg-gradient-to-r from-[#17231C] via-[#17231C]/90 to-[#17231C]/35'
                : 'bg-gradient-to-r from-[#F5F2EB] via-[#F5F2EB]/92 to-transparent'
            }`}
          />
        </div>

        {/* Left Greeting Lockup */}
        <div className="relative z-10 flex items-start sm:items-center gap-4">
          {/* Warm Sun Emblem */}
          <button
            type="button"
            onClick={() =>
              setGreetingPeriod((p) =>
                p === 'morning' ? 'afternoon' : p === 'afternoon' ? 'evening' : 'morning'
              )
            }
            title="Click to preview morning / afternoon / evening greeting"
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer group"
          >
            <svg
              viewBox="0 0 48 48"
              className="w-11 h-11 transition-transform duration-200 group-hover:scale-105"
            >
              <circle cx="24" cy="24" r="10" fill="#F2B84B" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line
                  key={deg}
                  x1="24"
                  y1="6"
                  x2="24"
                  y2="10"
                  stroke="#F2B84B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 24 24)`}
                />
              ))}
            </svg>
          </button>

          <div>
            <h1
              className={`font-serif-display text-3xl sm:text-[38px] font-semibold tracking-tight leading-tight ${
                darkMode ? 'text-[#EAF2ED]' : 'text-[#1A3826]'
              }`}
            >
              Good {greetingPeriod}, {state.profile.firstName}
            </h1>
            <p
              className={`text-[13.5px] mt-0.5 ${
                darkMode ? 'text-[#A6B8AD]' : 'text-[#49534D]'
              }`}
            >
              Here&apos;s what&apos;s happening in your life today.
            </p>
          </div>
        </div>

        {/* Right Handwritten Motivational Quote + Customize Trigger */}
        <div className="hidden md:flex items-center gap-6 relative z-10 pr-4">
          <p
            className={`font-script text-[21px] leading-[1.2] max-w-[185px] ${
              darkMode ? 'text-[#E5EFE8]' : 'text-[#28362D]'
            }`}
          >
            {state.profile.motivationalQuote ||
              'Small steps every day lead to big dreams.'}
          </p>
        </div>
      </section>

      {/* =====================================================================
          2. MAIN DASHBOARD GRID + RIGHT QUICK-ACTIONS RAIL
      ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT 9/12 AREA (KPI Row + 3-Column Core Modules) */}
        <div className="xl:col-span-9 space-y-5">
          {/* 5 Top Summary Cards */}
          {isWidgetVisible('kpi-cards') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Today's Tasks */}
              <div
                onClick={() => onNavigate('tasks')}
                className={`${cardSurface} rounded-2xl border p-4 cursor-pointer hover:border-[#C5D1C8] transition-all flex flex-col justify-between min-h-[122px]`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#234732] text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[13px] font-medium text-[#4A534E] dark:text-[#B8C7BE]">
                    Today&apos;s Tasks
                  </span>
                </div>
                <div className="mt-3 pl-1">
                  <div className="text-[26px] font-bold tracking-tight tabular-nums leading-none">
                    {remainingTasks.length}
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-xs text-[#6E7671]">
                    <span>remaining</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5A625D]" />
                  </div>
                </div>
              </div>

              {/* Card 2: Monthly Income */}
              <div
                onClick={() => onNavigate('finance')}
                className={`${cardSurface} rounded-2xl border p-4 cursor-pointer hover:border-[#C5D1C8] transition-all flex flex-col justify-between min-h-[122px]`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E1F0E6] text-[#266941] flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-medium text-[#4A534E] dark:text-[#B8C7BE]">
                    Monthly Income
                  </span>
                </div>
                <div className="mt-3 pl-1">
                  <div className="text-[25px] font-bold tracking-tight tabular-nums leading-none">
                    {hideBalance
                      ? '$•••••'
                      : `${state.profile.currencySymbol}${monthlyIncome.toLocaleString()}`}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] whitespace-nowrap">
                    <span className="text-[#267347] font-semibold tabular-nums">
                      ↑ 12%
                    </span>
                    <span className="text-[#7A827D]">vs last month</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Monthly Expenses */}
              <div
                onClick={() => onNavigate('finance')}
                className={`${cardSurface} rounded-2xl border p-4 cursor-pointer hover:border-[#C5D1C8] transition-all flex flex-col justify-between min-h-[122px]`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FCE8E6] text-[#C8524B] flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-medium text-[#4A534E] dark:text-[#B8C7BE]">
                    Monthly Expenses
                  </span>
                </div>
                <div className="mt-3 pl-1">
                  <div className="text-[25px] font-bold tracking-tight tabular-nums leading-none">
                    {hideBalance
                      ? '$•••••'
                      : `${state.profile.currencySymbol}${monthlyExpenses.toLocaleString()}`}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] whitespace-nowrap">
                    <span className="text-[#C8524B] font-semibold tabular-nums">
                      ↑ 8%
                    </span>
                    <span className="text-[#7A827D]">vs last month</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Family Members */}
              <div
                onClick={() => onNavigate('family')}
                className={`${cardSurface} rounded-2xl border p-4 cursor-pointer hover:border-[#C5D1C8] transition-all flex flex-col justify-between min-h-[122px]`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E3F0F5] text-[#2F6E85] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-medium text-[#4A534E] dark:text-[#B8C7BE]">
                    Family Members
                  </span>
                </div>
                <div className="mt-3 pl-1">
                  <div className="text-[26px] font-bold tracking-tight tabular-nums leading-none">
                    {state.familyMembers.length}
                  </div>
                  <div className="mt-1.5 text-xs text-[#6E7671]">
                    active members
                  </div>
                </div>
              </div>

              {/* Card 5: Upcoming Events */}
              <div
                onClick={() => onNavigate('calendar')}
                className={`${cardSurface} rounded-2xl border p-4 cursor-pointer hover:border-[#C5D1C8] transition-all flex flex-col justify-between min-h-[122px]`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E1EFE8] text-[#23573C] flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-medium text-[#4A534E] dark:text-[#B8C7BE]">
                    Upcoming Events
                  </span>
                </div>
                <div className="mt-3 pl-1">
                  <div className="text-[26px] font-bold tracking-tight tabular-nums leading-none">
                    2
                  </div>
                  <div className="mt-1.5 text-xs text-[#6E7671]">today</div>
                </div>
              </div>
            </div>
          )}

          {/* 3-Column Inner Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ===============================================================
                COLUMN 1: Today's Schedule + Recent Transactions
            =============================================================== */}
            <div className="lg:col-span-4 space-y-5">
              {/* Today's Schedule Card */}
              {isWidgetVisible('schedule') && (
                <div className={`${cardSurface} rounded-2xl border p-5`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-[15.5px] font-semibold tracking-tight">
                      Today&apos;s Schedule
                    </h2>
                    <button
                      type="button"
                      onClick={() => onNavigate('calendar')}
                      className="text-xs text-[#5A625D] hover:text-[#1E3F2B] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Calendar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-[#7A827D] mt-0.5 mb-4">
                    Mon, 12 Oct 2025
                  </p>

                  <div className="relative pl-2 space-y-1">
                    {/* Vertical Hairline Timeline Line */}
                    <div
                      className={`absolute left-[11px] top-3 bottom-3 w-[1px] ${
                        darkMode ? 'bg-[#293830]' : 'bg-[#EAE5DC]'
                      }`}
                    />

                    {scheduleEvents.map((ev) => {
                      const IconComp = getScheduleIcon(ev.title);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => onNavigate('calendar')}
                          className={`relative flex items-center gap-3 py-2.5 px-1 rounded-xl transition-colors cursor-pointer ${
                            darkMode
                              ? 'hover:bg-[#1E2C24]'
                              : 'hover:bg-[#F7F5F0]'
                          }`}
                        >
                          {/* Colored Timeline Dot */}
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 relative z-10 ${getDotColorClass(
                              ev.dotColor
                            )}`}
                          />
                          {/* Time */}
                          <span className="text-xs text-[#6E7671] w-[62px] shrink-0 tabular-nums">
                            {ev.startTime}
                          </span>
                          {/* Tinted Circle Icon */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              darkMode
                                ? 'bg-[#233329] text-[#A8C3B1]'
                                : 'bg-[#EFF2EE] text-[#2B4736]'
                            }`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          {/* Event Title & Location */}
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold leading-tight truncate">
                              {ev.title}
                            </p>
                            <p className="text-[11px] text-[#7A827D] mt-0.5 truncate">
                              {ev.location}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Transactions Card */}
              {isWidgetVisible('transactions') && (
                <div className={`${cardSurface} rounded-2xl border p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[15.5px] font-semibold tracking-tight">
                      Recent Transactions
                    </h2>
                    <button
                      type="button"
                      onClick={() => onNavigate('finance')}
                      className="text-xs text-[#5A625D] hover:text-[#1E3F2B] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="divide-y divide-[#F0ECE3] dark:divide-[#24332A]">
                    {state.transactions.slice(0, 4).map((tx, index) => {
                      const isIncome = tx.type === 'income';
                      const dateLabel =
                        index === 0
                          ? 'Today'
                          : index === 1
                          ? 'Yesterday'
                          : tx.date === '2025-10-10'
                          ? 'Oct 10'
                          : tx.date === '2025-10-08'
                          ? 'Oct 8'
                          : tx.date;

                      const iconWrapStyle =
                        tx.category === 'Food'
                          ? 'bg-[#FCECE9] text-[#D45B4C]'
                          : tx.category === 'Salary' || isIncome
                          ? 'bg-[#E4F2E9] text-[#286E44]'
                          : tx.category === 'Bills'
                          ? 'bg-[#FCE8E8] text-[#C84B4B]'
                          : 'bg-[#EFEAF9] text-[#6B52B8]';

                      const TxIcon =
                        tx.category === 'Food'
                          ? ShoppingBag
                          : isIncome
                          ? Landmark
                          : tx.category === 'Bills'
                          ? Bell
                          : Pill;

                      return (
                        <div
                          key={tx.id}
                          onClick={() => onNavigate('finance')}
                          className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconWrapStyle}`}
                            >
                              <TxIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold truncate">
                                {tx.description}
                              </p>
                              <p className="text-[11px] text-[#7A827D]">
                                {tx.category}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p
                              className={`text-[13px] font-semibold tabular-nums ${
                                isIncome ? 'text-[#287848]' : 'text-[#C84E47]'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {state.profile.currencySymbol}
                              {tx.amount.toLocaleString()}
                            </p>
                            <p className="text-[11px] text-[#878F8A]">{dateLabel}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ===============================================================
                COLUMN 2: Finance Overview + Family
            =============================================================== */}
            <div className="lg:col-span-4 space-y-5">
              {/* Finance Overview Card */}
              {isWidgetVisible('finance') && (
                <div className={`${cardSurface} rounded-2xl border p-5`}>
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-[15.5px] font-semibold tracking-tight">
                      Finance Overview
                    </h2>
                    <div className="relative">
                      <select
                        value={financePeriod}
                        onChange={(e) => setFinancePeriod(e.target.value as any)}
                        aria-label="Select finance period"
                        className={`appearance-none pr-6 pl-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer focus:outline-none ${
                          darkMode
                            ? 'bg-[#213027] text-[#C4D1C9]'
                            : 'bg-transparent text-[#5A625D] hover:bg-[#F2EFE9]'
                        }`}
                      >
                        <option value="month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="year">This Year</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#7A827D] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Deep Forest Green Total Balance Banner */}
                  <div className="rounded-2xl bg-gradient-to-r from-[#1D3927] via-[#234530] to-[#2C533B] text-white p-4 shadow-sm">
                    <p className="text-xs text-[#C6D9CC] font-medium">
                      Total Balance
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-[28px] font-bold tracking-tight tabular-nums leading-none">
                          {hideBalance
                            ? '$••••••'
                            : `${state.profile.currencySymbol}${totalBalance.toLocaleString()}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setHideBalance((prev) => !prev)}
                          className="text-[#B4CCBC] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                          aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
                        >
                          {hideBalance ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('finance')}
                        className="p-1.5 rounded-lg text-[#D5E6DA] hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Open Finance module"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3 Tinted Summary Mini-Cards: Income, Expenses, Savings */}
                  <div className="grid grid-cols-3 gap-2.5 mt-3">
                    <div
                      onClick={() => onNavigate('finance')}
                      className={`rounded-xl p-3 cursor-pointer ${
                        darkMode ? 'bg-[#1D3125]' : 'bg-[#EAF4EC]'
                      }`}
                    >
                      <p className="text-[11px] font-medium text-[#2A6640] dark:text-[#8BD4A4]">
                        Income
                      </p>
                      <p className="text-[16px] font-bold tabular-nums mt-1 leading-tight">
                        {hideBalance
                          ? '$••••'
                          : `${state.profile.currencySymbol}${monthlyIncome.toLocaleString()}`}
                      </p>
                      <p className="text-[11px] font-semibold text-[#2A7848] dark:text-[#8BD4A4] mt-1 tabular-nums">
                        ↑ 12%
                      </p>
                    </div>

                    <div
                      onClick={() => onNavigate('finance')}
                      className={`rounded-xl p-3 cursor-pointer ${
                        darkMode ? 'bg-[#301F20]' : 'bg-[#FCEEEE]'
                      }`}
                    >
                      <p className="text-[11px] font-medium text-[#B84A4A] dark:text-[#F29B9B]">
                        Expenses
                      </p>
                      <p className="text-[16px] font-bold tabular-nums mt-1 leading-tight">
                        {hideBalance
                          ? '$••••'
                          : `${state.profile.currencySymbol}${monthlyExpenses.toLocaleString()}`}
                      </p>
                      <p className="text-[11px] font-semibold text-[#C44D4D] dark:text-[#F29B9B] mt-1 tabular-nums">
                        ↑ 8%
                      </p>
                    </div>

                    <div
                      onClick={() => onNavigate('finance')}
                      className={`rounded-xl p-3 cursor-pointer ${
                        darkMode ? 'bg-[#242233]' : 'bg-[#F2EFFB]'
                      }`}
                    >
                      <p className="text-[11px] font-medium text-[#544696] dark:text-[#B5A8F5]">
                        Savings
                      </p>
                      <p className="text-[16px] font-bold tabular-nums mt-1 leading-tight">
                        {hideBalance
                          ? '$••••'
                          : `${state.profile.currencySymbol}${monthlySavings.toLocaleString()}`}
                      </p>
                      <p className="text-[11px] font-semibold text-[#544696] dark:text-[#B5A8F5] mt-1 tabular-nums">
                        ↑ 15%
                      </p>
                    </div>
                  </div>

                  {/* Spending Overview Donut Chart & Category Breakdown */}
                  <div className="mt-4 pt-3 border-t border-[#F0ECE3] dark:border-[#26352C]">
                    <h3 className="text-[13.5px] font-semibold mb-3">
                      Spending Overview
                    </h3>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <svg
                          width="108"
                          height="108"
                          viewBox="0 0 108 108"
                          className="-rotate-90"
                        >
                          <circle
                            cx="54"
                            cy="54"
                            r="40"
                            fill="transparent"
                            stroke={darkMode ? '#24332A' : '#EFECE4'}
                            strokeWidth="15"
                          />
                          {renderDonutSegments()}
                        </svg>
                        <button
                          type="button"
                          onClick={() => onNavigate('finance')}
                          className="mt-2 text-[11px] text-[#6E7671] hover:text-[#1E3F2B] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <span>View detailed report</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        {spendingBreakdown.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-[#4B534E] dark:text-[#C4D1C9]">
                                {item.label}
                              </span>
                            </div>
                            <span className="font-semibold tabular-nums text-[#2A312D] dark:text-[#EDF2EE]">
                              {item.pct}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Family Card */}
              {isWidgetVisible('family') && (
                <div className={`${cardSurface} rounded-2xl border p-5`}>
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-[15.5px] font-semibold tracking-tight">
                      Family
                    </h2>
                    <button
                      type="button"
                      onClick={() => onNavigate('family')}
                      className="text-xs text-[#5A625D] hover:text-[#1E3F2B] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Two Child Portrait Cards side-by-side matching Reference Image */}
                  <div className="grid grid-cols-2 gap-3">
                    {state.familyMembers.slice(0, 2).map((member, idx) => {
                      const isBlush = idx === 0;
                      return (
                        <div
                          key={member.id}
                          onClick={() => onNavigate('family', member.id)}
                          className={`rounded-2xl p-3.5 flex flex-col items-center text-center cursor-pointer transition-transform hover:-translate-y-0.5 ${
                            darkMode
                              ? isBlush
                                ? 'bg-[#2C2023]'
                                : 'bg-[#1D2830]'
                              : isBlush
                              ? 'bg-[#F9ECEC]'
                              : 'bg-[#EAF2F8]'
                          }`}
                        >
                          <AvatarImage
                            photoKey={member.photo}
                            name={member.name}
                            className="w-16 h-16 rounded-full ring-2 ring-white shadow-xs"
                          />
                          <h3 className="text-[14px] font-semibold mt-2.5">
                            {member.name}
                          </h3>
                          <p className="text-[11px] text-[#6E7671] dark:text-[#A9B8AF] mt-0.5">
                            {member.ageText}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* 4 Quick Category Filter Icons: School, Activities, Health, Tasks */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-2">
                    {[
                      {
                        label: 'School',
                        icon: GraduationCap,
                        tint: 'bg-[#F0ECF9] text-[#6852B2]',
                      },
                      {
                        label: 'Activities',
                        icon: Shapes,
                        tint: 'bg-[#E5F2EA] text-[#2B7347]',
                      },
                      {
                        label: 'Health',
                        icon: Heart,
                        tint: 'bg-[#FCECEC] text-[#C85252]',
                      },
                      {
                        label: 'Tasks',
                        icon: CheckSquare,
                        tint: 'bg-[#E8F1FA] text-[#3B76B5]',
                      },
                    ].map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => onNavigate('family', cat.label)}
                          className="flex flex-col items-center gap-1.5 group cursor-pointer"
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${cat.tint}`}
                          >
                            <CatIcon className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] text-[#5A625D] dark:text-[#A9B8AF] font-medium">
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ===============================================================
                COLUMN 3: October 2025 Calendar + Upcoming Events + Quick Notes
            =============================================================== */}
            <div className="lg:col-span-4 space-y-5">
              {/* Mini Calendar Widget */}
              {isWidgetVisible('calendar') && (
                <div className={`${cardSurface} rounded-2xl border p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[15.5px] font-semibold tracking-tight">
                      October 2025
                    </h2>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCalDay((d) => (d > 1 ? d - 1 : 31))
                        }
                        className="p-1 rounded-lg text-[#6E7671] hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
                        aria-label="Previous day"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCalDay((d) => (d < 31 ? d + 1 : 1))
                        }
                        className="p-1 rounded-lg text-[#6E7671] hover:bg-[#F2EFE9] dark:hover:bg-[#223129]"
                        aria-label="Next day"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 text-center text-[11px] text-[#878F8A] font-medium mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                      (d) => (
                        <span key={d}>{d}</span>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs tabular-nums">
                    {/* Empty leading slots for Oct 2025 (Starts on Wed) */}
                    <span className="py-1 text-transparent select-none">0</span>
                    <span className="py-1 text-transparent select-none">0</span>
                    <span className="py-1 text-transparent select-none">0</span>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const isSelected = day === selectedCalDay;
                      const hasDot = [6, 8, 12, 13, 14, 18, 22, 25, 27].includes(
                        day
                      );
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedCalDay(day)}
                          className="flex flex-col items-center justify-center py-0.5 cursor-pointer group"
                        >
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors ${
                              isSelected
                                ? 'bg-[#234732] text-white font-semibold shadow-xs'
                                : darkMode
                                ? 'text-[#D2E0D7] group-hover:bg-[#23342A]'
                                : 'text-[#2A312D] group-hover:bg-[#F0ECE3]'
                            }`}
                          >
                            {day}
                          </span>
                          <span
                            className={`w-1 h-1 rounded-full mt-0.5 ${
                              hasDot
                                ? day === 18
                                  ? 'bg-[#D96B52]'
                                  : 'bg-[#2E6F48]'
                                : 'bg-transparent'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upcoming Events Card */}
              {isWidgetVisible('events') && (
                <div className={`${cardSurface} rounded-2xl border p-5`}>
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-[15.5px] font-semibold tracking-tight">
                      Upcoming Events
                    </h2>
                    <button
                      type="button"
                      onClick={() => onNavigate('calendar')}
                      className="text-xs text-[#5A625D] hover:text-[#1E3F2B] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="divide-y divide-[#F0ECE3] dark:divide-[#24332A]">
                    {upcomingEvents.map((ev) => {
                      const isBday = ev.title.toLowerCase().includes('birthday');
                      const isHealth = ev.category === 'Health';
                      const EvIcon = isBday
                        ? Cake
                        : isHealth
                        ? Heart
                        : Car;
                      const badgeColor = isBday
                        ? 'bg-[#FCECE9] text-[#D46253]'
                        : isHealth
                        ? 'bg-[#FCEAEA] text-[#C85252]'
                        : 'bg-[#EAF0FA] text-[#4775B8]';

                      const formattedDate =
                        ev.date === '2025-10-12'
                          ? '12 Oct 2025'
                          : ev.date === '2025-10-14'
                          ? '14 Oct 2025'
                          : ev.date === '2025-10-18'
                          ? '18 Oct 2025'
                          : ev.date === '2025-10-22'
                          ? '22 Oct 2025'
                          : ev.date;

                      return (
                        <div
                          key={ev.id}
                          onClick={() => onNavigate('calendar')}
                          className="py-2.5 first:pt-1 last:pb-1 flex items-center gap-3 cursor-pointer hover:opacity-90"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${badgeColor}`}
                          >
                            <EvIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="w-[84px] shrink-0">
                            <p className="text-[11.5px] font-medium tabular-nums">
                              {formattedDate}
                            </p>
                            <p className="text-[10.5px] text-[#7A827D] tabular-nums">
                              {ev.startTime}
                            </p>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-semibold truncate">
                              {ev.title}
                            </p>
                            <p className="text-[11px] text-[#7A827D] truncate">
                              {ev.location}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Notes Card */}
              {isWidgetVisible('notes') && (
                <div className={`${cardSurface} rounded-2xl border p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[15.5px] font-semibold tracking-tight">
                      Quick Notes
                    </h2>
                    <button
                      type="button"
                      onClick={() => onNavigate('notes')}
                      className="text-xs text-[#5A625D] hover:text-[#1E3F2B] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Shopping List with Live Interactive Checkboxes */}
                  {shoppingNote && (
                    <div
                      className={`rounded-xl p-3 mb-3 border ${
                        darkMode
                          ? 'bg-[#141E18] border-[#26352C]'
                          : 'bg-[#FAF8F3] border-[#EDE8DF]'
                      }`}
                    >
                      <p className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                        <span className="w-2 h-2 rounded-xs bg-[#E2A952]" />
                        <span>{shoppingNote.title}</span>
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {shoppingNote.checklistItems.slice(0, 4).map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-2 text-xs cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() =>
                                onToggleNoteChecklistItem(
                                  shoppingNote.id,
                                  item.id
                                )
                              }
                              className="w-3.5 h-3.5 rounded border-[#D2CCC0] text-[#234732] focus:ring-0"
                            />
                            <span
                              className={
                                item.completed
                                  ? 'line-through text-[#878F8A]'
                                  : 'text-[#49524C] dark:text-[#C4D1C9]'
                              }
                            >
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ideas & Work Notes */}
                  <div className="space-y-2.5 mb-3.5">
                    {otherQuickNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => onNavigate('notes')}
                        className="cursor-pointer group"
                      >
                        <p className="text-xs font-semibold flex items-center gap-1.5 group-hover:text-[#234732]">
                          <span className="w-2 h-2 rounded-xs bg-[#D89B48]" />
                          <span>{note.title}</span>
                        </p>
                        <p className="text-[11px] text-[#7A827D] pl-3.5 truncate mt-0.5">
                          ✓ {note.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenQuickAction('note')}
                    className={`w-full py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      darkMode
                        ? 'border-[#2A3A30] text-[#B8C7BE] hover:bg-[#213027]'
                        : 'border-[#E6E1D6] text-[#49524C] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Note</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT 3/12 CONTEXT RAIL: Quick Actions, Upcoming Events, Reminders, Botanical Card
        =================================================================== */}
        {isWidgetVisible('quick-actions') && (
          <div className="xl:col-span-3 space-y-5">
            {/* Quick Actions Card */}
            <div className={`${cardSurface} rounded-2xl border p-5`}>
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-[15px] font-semibold tracking-tight">
                  Quick Actions
                </h2>
                <button
                  type="button"
                  onClick={() => onOpenQuickAction('customize-dashboard')}
                  className="text-[#7A827D] hover:text-[#234732] p-1 rounded-lg"
                  title="Customize Dashboard Widgets"
                  aria-label="Customize Dashboard Widgets"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onOpenQuickAction('task')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-[13px] font-medium flex items-center gap-3 transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-[#141E18] border-[#28382E] hover:bg-[#1E2D24]'
                      : 'bg-[#FAF8F4] border-[#E8E3D9] hover:bg-[#F0ECE3]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#234732] text-white flex items-center justify-center shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span>Add Task</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenQuickAction('transaction')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-[13px] font-medium flex items-center gap-3 transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-[#141E18] border-[#28382E] hover:bg-[#1E2D24]'
                      : 'bg-[#FAF8F4] border-[#E8E3D9] hover:bg-[#F0ECE3]'
                  }`}
                >
                  <Coins className="w-4 h-4 text-[#234732] dark:text-[#8BD4A4] ml-1 shrink-0" />
                  <span>Add Income / Expense</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenQuickAction('event')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-[13px] font-medium flex items-center gap-3 transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-[#141E18] border-[#28382E] hover:bg-[#1E2D24]'
                      : 'bg-[#FAF8F4] border-[#E8E3D9] hover:bg-[#F0ECE3]'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 text-[#234732] dark:text-[#8BD4A4] ml-1 shrink-0" />
                  <span>Add Event</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenQuickAction('reminder')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-[13px] font-medium flex items-center gap-3 transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-[#141E18] border-[#28382E] hover:bg-[#1E2D24]'
                      : 'bg-[#FAF8F4] border-[#E8E3D9] hover:bg-[#F0ECE3]'
                  }`}
                >
                  <Bell className="w-4 h-4 text-[#234732] dark:text-[#8BD4A4] ml-1 shrink-0" />
                  <span>Add Reminder</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenQuickAction('note')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-[13px] font-medium flex items-center gap-3 transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-[#141E18] border-[#28382E] hover:bg-[#1E2D24]'
                      : 'bg-[#FAF8F4] border-[#E8E3D9] hover:bg-[#F0ECE3]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#234732] dark:text-[#8BD4A4] ml-1 shrink-0" />
                  <span>Add Note</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenQuickAction('family')}
                    className={`px-2.5 py-2 rounded-xl border text-[11.5px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      darkMode
                        ? 'bg-[#141E18] border-[#28382E] hover:bg-[#1E2D24]'
                        : 'bg-[#FAF8F4] border-[#E8E3D9] hover:bg-[#F0ECE3]'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#234732] dark:text-[#8BD4A4]" />
                    <span>+ Family</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenQuickAction('document')}
                    className={`px-2.5 py-2 rounded-xl border text-[11.5px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      darkMode
                        ? 'bg-[#141E18] border-[#28382E] hover:bg-[#1E2D24]'
                        : 'bg-[#FAF8F4] border-[#E8E3D9] hover:bg-[#F0ECE3]'
                    }`}
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-[#234732] dark:text-[#8BD4A4]" />
                    <span>+ Document</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Rail Upcoming Events / Important Dates Card */}
            <div className={`${cardSurface} rounded-2xl border p-5`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14.5px] font-semibold tracking-tight">
                  Upcoming Events
                </h2>
                <button
                  type="button"
                  onClick={() => onOpenQuickAction('important-dates')}
                  className="text-xs text-[#5A625D] hover:text-[#1E3F2B] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="divide-y divide-[#F0ECE3] dark:divide-[#24332A]">
                {[
                  {
                    date: '12 Oct 2025',
                    time: '3:00 PM',
                    title: 'Pick up Emma',
                    sub: 'School',
                    tint: 'bg-[#FCECE9] text-[#D46253]',
                    icon: Car,
                  },
                  {
                    date: '14 Oct 2025',
                    time: '3:00 PM',
                    title: 'Parent Meeting',
                    sub: 'School',
                    tint: 'bg-[#E5F2EA] text-[#2B7347]',
                    icon: Users,
                  },
                  {
                    date: '18 Oct 2025',
                    time: 'All Day',
                    title: "Mom's Birthday",
                    sub: '',
                    tint: 'bg-[#FCECE9] text-[#D46253]',
                    icon: Cake,
                  },
                  {
                    date: '22 Oct 2025',
                    time: '10:00 AM',
                    title: 'Doctor Appointment',
                    sub: 'Health',
                    tint: 'bg-[#EFEAF9] text-[#6B52B8]',
                    icon: Stethoscope,
                  },
                ].map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => onNavigate('calendar')}
                      className="py-2.5 first:pt-1 last:pb-1 flex items-center gap-2.5 cursor-pointer hover:opacity-90"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${item.tint}`}
                      >
                        <ItemIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="w-[74px] shrink-0">
                        <p className="text-[11px] font-medium tabular-nums">
                          {item.date}
                        </p>
                        <p className="text-[10px] text-[#7A827D] tabular-nums">
                          {item.time}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">
                          {item.title}
                        </p>
                        {item.sub && (
                          <p className="text-[10.5px] text-[#7A827D]">
                            {item.sub}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Rail Reminders Card */}
            <div className={`${cardSurface} rounded-2xl border p-5`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14.5px] font-semibold tracking-tight">
                  Reminders
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('reminders')}
                  className="text-xs text-[#5A625D] hover:text-[#1E3F2B] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {state.reminders.slice(0, 3).map((rem, i) => {
                  const RemIcon =
                    i === 0 ? Pill : i === 1 ? AlarmClock : Moon;
                  const iconTint =
                    i === 0
                      ? 'bg-[#FCECE9] text-[#D45B4C]'
                      : i === 1
                      ? 'bg-[#E5F2EA] text-[#2B7347]'
                      : 'bg-[#E9F0FA] text-[#4775B8]';
                  return (
                    <div
                      key={rem.id}
                      onClick={() => onNavigate('reminders')}
                      className="flex items-center justify-between gap-2 cursor-pointer py-1 hover:opacity-90"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconTint}`}
                        >
                          <RemIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11.5px] text-[#6E7671] tabular-nums w-14 shrink-0">
                          {rem.time}
                        </span>
                        <span className="text-xs font-semibold truncate">
                          {rem.title}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-[#878F8A] shrink-0">
                        Day
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Botanical Mindfulness Card ("Stay organized. Live better.") */}
            <div
              className={`relative rounded-2xl border p-5 overflow-hidden ${
                darkMode
                  ? 'bg-[#1A2920] border-[#2C4234]'
                  : 'bg-[#E7ECE5] border-[#DCE3DA]'
              }`}
            >
              <img
                src={VISUAL_ASSETS.botanicalCornerArt}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="w-28 h-32 object-cover absolute -right-2 -bottom-2 opacity-75 pointer-events-none select-none mix-blend-multiply"
              />
              <div className="relative z-10 max-w-[165px]">
                <p
                  className={`text-[13.5px] font-medium leading-snug ${
                    darkMode ? 'text-[#E5EFE8]' : 'text-[#243B2C]'
                  }`}
                >
                  Stay organized.
                  <br />
                  Live better.
                </p>
                <Heart className="w-4 h-4 text-[#496953] mt-2.5" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
