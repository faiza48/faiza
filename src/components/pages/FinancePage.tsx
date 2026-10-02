import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Target,
  Coins,
  Eye,
  EyeOff,
} from 'lucide-react';
import type {
  DailyraState,
  Transaction,
  ExpenseCategory,
  IncomeCategory,
  PaymentMethod,
} from '../../types/dailyra';
import { Modal, ConfirmDialog, EmptyState } from '../ui/CommonUI';

interface FinancePageProps {
  state: DailyraState;
  darkMode: boolean;
  onCreateTransaction: (payload: Record<string, unknown>) => Promise<void>;
  onUpdateTransaction: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onUpdateBudget: (id: string, limitAmount: number) => Promise<void>;
  onCreateSavingsGoal: (payload: Record<string, unknown>) => Promise<void>;
  onUpdateSavingsGoal: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onDeleteSavingsGoal: (id: string) => Promise<void>;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Home',
  'Transport',
  'Family',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Education',
  'Other',
];

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Other',
];

export const FinancePage: React.FC<FinancePageProps> = ({
  state,
  darkMode,
  onCreateTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onUpdateBudget,
  onCreateSavingsGoal,
  onUpdateSavingsGoal,
  onDeleteSavingsGoal,
}) => {
  const [hideNumbers, setHideNumbers] = useState(state.settings.hideBalanceByDefault);
  const [txFilterType, setTxFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [txSearch, setTxSearch] = useState('');

  // Transaction Modal
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory>('Food');
  const [date, setDate] = useState('2025-10-12');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [notes, setNotes] = useState('');

  // Savings Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('10000');
  const [goalCurrent, setGoalCurrent] = useState('2500');
  const [goalDate, setGoalDate] = useState('2026-06-01');

  // Budget Editing
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState('');

  const openNewTx = (initialType: 'income' | 'expense' = 'expense') => {
    setEditingTx(null);
    setType(initialType);
    setDescription('');
    setAmount('');
    setCategory(initialType === 'income' ? 'Salary' : 'Food');
    setDate('2025-10-12');
    setPaymentMethod('Credit Card');
    setNotes('');
    setIsTxModalOpen(true);
  };

  const openEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setType(tx.type);
    setDescription(tx.description);
    setAmount(String(tx.amount));
    setCategory(tx.category);
    setDate(tx.date);
    setPaymentMethod(tx.paymentMethod);
    setNotes(tx.notes);
    setIsTxModalOpen(true);
  };

  const totalIncome = useMemo(
    () =>
      state.transactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0),
    [state.transactions]
  );

  const totalExpenses = useMemo(
    () =>
      state.transactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0),
    [state.transactions]
  );

  const netSavings = Math.max(0, totalIncome - totalExpenses);
  const totalBalance = 9780 + netSavings;

  const categorySpendMap = useMemo(() => {
    const map: Record<string, number> = {};
    state.transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [state.transactions]);

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter((tx) => {
      if (txFilterType !== 'all' && tx.type !== txFilterType) return false;
      if (txSearch.trim()) {
        const q = txSearch.toLowerCase();
        return (
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          tx.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.transactions, txFilterType, txSearch]);

  const cardSurface = darkMode
    ? 'bg-[#18231D] border-[#28382E] text-[#EDF2EE]'
    : 'bg-[#FDFCFB] border-[#EAE5DC] text-[#1F2421]';

  const inputClass = `w-full px-3.5 py-2 rounded-xl border text-xs transition-colors focus:outline-none ${
    darkMode
      ? 'bg-[#121B16] border-[#2C3E33] text-[#EDF2EE]'
      : 'bg-[#F8F6F1] border-[#E2DDD2] text-[#1F2421]'
  }`;

  const fmt = (val: number) =>
    hideNumbers ? '$•••••' : `${state.profile.currencySymbol}${val.toLocaleString()}`;

  return (
    <div className="px-4 sm:px-7 py-6 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Personal Finance & Budgets
          </h1>
          <p className="text-xs text-[#6E7671] mt-1">
            Calm, transparent tracking of household income, expenses, budgets, and savings goals.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setHideNumbers((p) => !p)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
              darkMode
                ? 'border-[#2C3E33] text-[#C4D1C9] hover:bg-[#213027]'
                : 'border-[#E2DDD2] text-[#49524C] hover:bg-[#EFECE4]'
            }`}
          >
            {hideNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{hideNumbers ? 'Show Amounts' : 'Privacy Mask'}</span>
          </button>
          <button
            type="button"
            onClick={() => openNewTx('income')}
            className="px-4 py-2 rounded-xl border border-[#234732] text-[#234732] dark:text-[#8BD4A4] text-xs font-medium hover:bg-[#E4E9E1]/50 cursor-pointer whitespace-nowrap"
          >
            + Add Income
          </button>
          <button
            type="button"
            onClick={() => openNewTx('expense')}
            className="px-4 py-2 rounded-xl bg-[#234732] hover:bg-[#1B3727] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Top 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-r from-[#1D3927] to-[#2C533B] text-white p-5">
          <p className="text-xs text-[#C6D9CC]">Total Balance</p>
          <p className="text-3xl font-bold tabular-nums mt-2">{fmt(totalBalance)}</p>
          <p className="text-[11px] text-[#B4CCBC] mt-2">
            ↑ +$2,670 added to net worth this month
          </p>
        </div>

        <div className={`${cardSurface} rounded-2xl border p-5`}>
          <p className="text-xs text-[#6E7671]">Monthly Income</p>
          <p className="text-3xl font-bold tabular-nums mt-2 text-[#267347]">
            {fmt(totalIncome)}
          </p>
          <p className="text-[11px] text-[#267347] font-medium mt-2">
            ↑ 12% vs last month ($4,285)
          </p>
        </div>

        <div className={`${cardSurface} rounded-2xl border p-5`}>
          <p className="text-xs text-[#6E7671]">Monthly Expenses</p>
          <p className="text-3xl font-bold tabular-nums mt-2 text-[#C84E47]">
            {fmt(totalExpenses)}
          </p>
          <p className="text-[11px] text-[#C84E47] font-medium mt-2">
            ↑ 8% vs last month ($1,972)
          </p>
        </div>

        <div className={`${cardSurface} rounded-2xl border p-5`}>
          <p className="text-xs text-[#6E7671]">Monthly Net Savings</p>
          <p className="text-3xl font-bold tabular-nums mt-2 text-[#544696] dark:text-[#B5A8F5]">
            {fmt(netSavings)}
          </p>
          <p className="text-[11px] text-[#544696] dark:text-[#B5A8F5] font-medium mt-2">
            ↑ 15% savings rate ({Math.round((netSavings / (totalIncome || 1)) * 100)}% of income)
          </p>
        </div>
      </div>

      {/* Middle Grid: Monthly Trend Chart + Category Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 6-Month Income vs Expenses Chart */}
        <div className={`${cardSurface} lg:col-span-7 rounded-2xl border p-6 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">Income vs. Expenses Trend</h2>
                <p className="text-xs text-[#7A827D]">
                  6-month household cashflow comparison
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#234732]" />
                  Income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E08B6B]" />
                  Expenses
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4 items-end h-48 pt-6 pb-2 px-2 border-b border-[#EDE9DF] dark:border-[#28382E]">
              {[
                { month: 'May', inc: 4200, exp: 1950 },
                { month: 'Jun', inc: 4400, exp: 2100 },
                { month: 'Jul', inc: 4350, exp: 2280 },
                { month: 'Aug', inc: 4500, exp: 1890 },
                { month: 'Sep', inc: 4285, exp: 1972 },
                { month: 'Oct', inc: totalIncome, exp: totalExpenses },
              ].map((m) => {
                const incHeight = Math.min(100, Math.round((m.inc / 5200) * 100));
                const expHeight = Math.min(100, Math.round((m.exp / 5200) * 100));
                return (
                  <div
                    key={m.month}
                    className="flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      <div
                        style={{ height: `${incHeight}%` }}
                        title={`${m.month} Income: $${m.inc.toLocaleString()}`}
                        className="w-4 sm:w-5 rounded-t-md bg-[#234732] transition-all"
                      />
                      <div
                        style={{ height: `${expHeight}%` }}
                        title={`${m.month} Expenses: $${m.exp.toLocaleString()}`}
                        className="w-4 sm:w-5 rounded-t-md bg-[#E08B6B] transition-all"
                      />
                    </div>
                    <span className="text-[11px] text-[#7A827D] font-medium">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings Goals Strip */}
          <div className="mt-6 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#234732]" />
                <span>Savings Goals</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(true)}
                className="text-xs text-[#234732] dark:text-[#8BD4A4] font-medium hover:underline"
              >
                + New Goal
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {state.savingsGoals.map((goal) => {
                const pct = Math.min(
                  100,
                  Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100)
                );
                return (
                  <div
                    key={goal.id}
                    className={`p-3.5 rounded-xl border ${
                      darkMode
                        ? 'bg-[#131C17] border-[#28382E]'
                        : 'bg-[#FAF8F4] border-[#EAE5DC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold truncate">{goal.title}</p>
                      <button
                        type="button"
                        onClick={() => onDeleteSavingsGoal(goal.id)}
                        className="text-[#878F8A] hover:text-[#B84A4A]"
                        aria-label={`Delete ${goal.title}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-[#6E7671] mt-1 tabular-nums">
                      {fmt(goal.currentAmount)} / {fmt(goal.targetAmount)} ({pct}%)
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-[#E5E0D5] dark:bg-[#24332A] mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#234732]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSavingsGoal(goal.id, {
                          currentAmount: goal.currentAmount + 250,
                        })
                      }
                      className="mt-2.5 text-[11px] text-[#234732] dark:text-[#8BD4A4] font-medium hover:underline"
                    >
                      + Add $250 deposit
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Budgets with Threshold Warnings */}
        <div className={`${cardSurface} lg:col-span-5 rounded-2xl border p-6 space-y-4`}>
          <div>
            <h2 className="text-base font-semibold">Monthly Category Budgets</h2>
            <p className="text-xs text-[#7A827D]">
              Alerts trigger when a budget exceeds {state.settings.budgetWarningThreshold}% usage.
            </p>
          </div>

          <div className="space-y-3.5">
            {state.budgets
              .filter((b) => b.category !== 'Monthly Total')
              .map((budget) => {
                const used = categorySpendMap[budget.category] || 0;
                const remaining = Math.max(0, budget.limitAmount - used);
                const pct = Math.min(
                  100,
                  Math.round((used / (budget.limitAmount || 1)) * 100)
                );
                const isNearLimit = pct >= state.settings.budgetWarningThreshold;

                return (
                  <div key={budget.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{budget.category}</span>
                        {isNearLimit && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#C8524B] font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            {pct}% used
                          </span>
                        )}
                      </div>

                      {editingBudgetId === budget.id ? (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            await onUpdateBudget(budget.id, Number(budgetInput));
                            setEditingBudgetId(null);
                          }}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="number"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            className="w-20 px-2 py-0.5 text-xs rounded border border-[#234732]"
                          />
                          <button
                            type="submit"
                            className="text-[11px] px-2 py-0.5 rounded bg-[#234732] text-white"
                          >
                            Save
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2 tabular-nums">
                          <span>
                            {fmt(used)} / {fmt(budget.limitAmount)}
                          </span>
                          <span className="text-[#7A827D]">
                            ({fmt(remaining)} left)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBudgetId(budget.id);
                              setBudgetInput(String(budget.limitAmount));
                            }}
                            className="text-[#878F8A] hover:text-[#234732]"
                            title="Edit budget limit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#EFECE4] dark:bg-[#24332A] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 95
                            ? 'bg-[#C84E47]'
                            : isNearLimit
                            ? 'bg-[#E29A44]'
                            : 'bg-[#2E6F48]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className={`${cardSurface} rounded-2xl border p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Transaction Ledger</h2>
            <p className="text-xs text-[#7A827D]">
              Complete record of monthly income and expenses
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F2EFE9] dark:bg-[#131C17]">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTxFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize cursor-pointer ${
                    txFilterType === t
                      ? 'bg-[#FDFCFB] dark:bg-[#23362B] text-[#1E3F2B] dark:text-white shadow-xs font-semibold'
                      : 'text-[#6E7671]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#878F8A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Search transactions..."
                className="pl-8 pr-3 py-1.5 rounded-xl border text-xs bg-[#F8F6F1] dark:bg-[#121B16] border-[#E2DDD2] dark:border-[#2C3E33]"
              />
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            title="Your financial overview will appear here."
            subtitle="Record your first income or expense transaction to begin tracking."
            actionLabel="Add Transaction"
            onAction={() => openNewTx('expense')}
            icon={<Coins className="w-5 h-5" />}
            darkMode={darkMode}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDE9DF] dark:border-[#28382E] text-[11px] text-[#7A827D] font-semibold">
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EFE9] dark:divide-[#24332A] text-xs">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#FAF8F4] dark:hover:bg-[#1E2B23] transition-colors"
                  >
                    <td className="py-3 px-3">
                      <p className="font-semibold">{tx.description}</p>
                      {tx.notes && (
                        <p className="text-[11px] text-[#7A827D] truncate max-w-xs">
                          {tx.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#5A625D] dark:text-[#A9B8AF]">
                      {tx.category}
                    </td>
                    <td className="py-3 px-3 tabular-nums text-[#6E7671]">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 text-[#6E7671]">{tx.paymentMethod}</td>
                    <td
                      className={`py-3 px-3 text-right font-semibold tabular-nums ${
                        tx.type === 'income' ? 'text-[#267347]' : 'text-[#C84E47]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {fmt(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditTx(tx)}
                          className="p-1.5 rounded-lg text-[#7A827D] hover:bg-[#EFECE4]"
                          aria-label={`Edit ${tx.description}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTxId(tx.id)}
                          className="p-1.5 rounded-lg text-[#7A827D] hover:text-[#B84A4A]"
                          aria-label={`Delete ${tx.description}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title={editingTx ? 'Edit Transaction' : 'Record Transaction'}
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = {
              type,
              description,
              amount: Number(amount),
              category,
              date,
              paymentMethod,
              notes,
            };
            if (editingTx) {
              await onUpdateTransaction(editingTx.id, payload);
            } else {
              await onCreateTransaction(payload);
            }
            setIsTxModalOpen(false);
          }}
          className="space-y-3.5"
        >
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F2EFE9] dark:bg-[#121B16]">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Food');
              }}
              className={`py-2 rounded-lg text-xs font-semibold ${
                type === 'expense'
                  ? 'bg-white dark:bg-[#23362B] text-[#C84E47] shadow-xs'
                  : 'text-[#6E7671]'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salary');
              }}
              className={`py-2 rounded-lg text-xs font-semibold ${
                type === 'income'
                  ? 'bg-white dark:bg-[#23362B] text-[#234732] dark:text-[#8BD4A4] shadow-xs'
                  : 'text-[#6E7671]'
              }`}
            >
              Income
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Description *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Amount ($) *</label>
              <input
                type="number"
                required
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={inputClass}
              >
                {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
                  (c) => (
                    <option key={c} value={c}>{c}</option>
                  )
                )}
              </select>
            </div>
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
              <label className="block text-xs font-medium mb-1">Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsTxModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </Modal>

      {/* New Savings Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Create Savings Goal"
        darkMode={darkMode}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreateSavingsGoal({
              title: goalTitle,
              targetAmount: Number(goalTarget),
              currentAmount: Number(goalCurrent),
              targetDate: goalDate,
            });
            setGoalTitle('');
            setIsGoalModalOpen(false);
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-medium mb-1">Goal Title *</label>
            <input
              type="text"
              required
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g., Home Solar Battery Reserve"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Target Amount ($)</label>
              <input
                type="number"
                required
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Current Saved ($)</label>
              <input
                type="number"
                required
                value={goalCurrent}
                onChange={(e) => setGoalCurrent(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Target Date</label>
            <input
              type="date"
              value={goalDate}
              onChange={(e) => setGoalDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs border border-[#E2DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-[#234732] text-white"
            >
              Save Goal
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingTxId)}
        title="Delete this transaction?"
        message="This action cannot be undone. Monthly financial totals will update automatically."
        onConfirm={() => {
          if (deletingTxId) onDeleteTransaction(deletingTxId);
        }}
        onCancel={() => setDeletingTxId(null)}
        darkMode={darkMode}
      />
    </div>
  );
};
