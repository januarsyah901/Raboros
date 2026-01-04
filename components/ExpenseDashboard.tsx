import React, { useMemo } from "react";
import {
  AlertCircle,
  Target,
  CheckCircle2,
  PieChart,
  Wallet,
} from "lucide-react";
import { ExpenseItem, CategoryType, Budget } from "../types";
import { CATEGORIES } from "../constants";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  expenses: ExpenseItem[];
  budget?: Budget | null;
  onEditBudget?: () => void;
}

// --- Utils ---
const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const formatRupiah = (number: number) => formatter.format(number);

// --- Sub-Component: Simple SVG Donut Chart ---
const CategoryDonut: React.FC<{
  data: Record<string, number>;
  total: number;
  theme: string;
}> = ({ data, total, theme }) => {
  if (total === 0) return null;

  let cumulativePercent = 0;
  const colors = [
    "text-indigo-500",
    "text-purple-500",
    "text-emerald-500",
    "text-amber-500",
    "text-rose-500",
  ];

  return (
    <div className="relative h-32 w-32 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
        {Object.entries(data).map(([cat, value], index) => {
          const numValue = value as number;
          const numTotal = total as number;
          const percent = numValue / numTotal;
          const dashArray = percent * 100 * 3.14; // Circumference approx
          const dashOffset = -cumulativePercent * 100 * 3.14;
          cumulativePercent += percent;

          return (
            <circle
              key={cat}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={`${dashArray} 314`}
              strokeDashoffset={dashOffset}
              className={`${
                colors[index % colors.length]
              } transition-all duration-1000 ease-out`}
            />
          );
        })}
      </svg>
      {/* Center Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <PieChart
          size={20}
          className={theme === "dark" ? "text-slate-600" : "text-slate-300"}
        />
      </div>
    </div>
  );
};

// --- Sub-Component: Budget Row ---
const BudgetRow: React.FC<{
  category: CategoryType;
  allocated: number;
  spent: number;
  theme: string;
}> = ({ category, allocated, spent, theme }) => {
  const percentReal = allocated > 0 ? (spent / allocated) * 100 : 0;
  const percentBar = Math.min(percentReal, 100);
  const isOverBudget = spent > allocated;

  return (
    <div className="group relative">
      <div className="mb-2 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor] ${
                isOverBudget
                  ? "bg-rose-500 text-rose-500"
                  : "bg-emerald-500 text-emerald-500"
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {category}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-sm font-bold tabular-nums ${
                theme === "dark" ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {formatRupiah(spent)}
            </span>
            <span
              className={`text-[10px] font-medium ${
                theme === "dark" ? "text-slate-600" : "text-slate-400"
              }`}
            >
              / {formatRupiah(allocated)}
            </span>
          </div>
        </div>
        <div
          className={`text-right ${
            isOverBudget ? "text-rose-400" : "text-emerald-500"
          }`}
        >
          <span className="block text-lg font-black tracking-tight">
            {percentReal.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div
        className={`h-2.5 w-full overflow-hidden rounded-full p-[2px] ${
          theme === "dark"
            ? "bg-slate-800/80"
            : "bg-slate-100 border border-slate-200"
        }`}
      >
        <div
          style={{ width: `${percentBar}%` }}
          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm
               ${
                 isOverBudget
                   ? "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                   : "bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-400"
               }`}
        />
      </div>
    </div>
  );
};

// --- Main Component ---
export const ExpenseDashboard: React.FC<Props> = ({
  expenses,
  budget,
  onEditBudget,
}) => {
  const { theme } = useTheme();

  // Calculation Logic
  const stats = useMemo(() => {
    return expenses.reduce(
      (acc, item) => {
        acc.total += item.price;
        acc.byCategory[item.category] =
          (acc.byCategory[item.category] || 0) + item.price;
        return acc;
      },
      { total: 0, byCategory: {} as Record<CategoryType, number> }
    );
  }, [expenses]);

  const lifestyleTotal = stats.byCategory[CategoryType.GAYA_HIDUP] || 0;
  const basicTotal = stats.byCategory[CategoryType.POKOK] || 0;
  const isAnomaly = lifestyleTotal > basicTotal;

  // Hitung total budget jika ada
  const totalBudget = budget
    ? Object.values(budget.allocations).reduce(
        (a: number, b: number) => a + b,
        0
      )
    : 0;
  const remainingBudget = (totalBudget as number) - (stats.total as number);

  // Styling Classes Constants
  const cardBaseClass = `rounded-[2rem] p-8 border backdrop-blur-md transition-all duration-300 ${
    theme === "dark"
      ? "border-slate-800 bg-slate-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
      : "border-slate-200 bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
  }`;

  return (
    <div className="space-y-6">
      {/* 1. Hero / Overview Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Total Expense Card */}
        <div className={`${cardBaseClass} relative overflow-hidden group`}>
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl transition-all group-hover:bg-indigo-500/20" />

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                  <Wallet size={12} />
                </span>
                <h1
                  className={`text-xs font-bold uppercase tracking-[0.2em] ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Total Keluaran
                </h1>
              </div>

              <div
                className={`text-4xl lg:text-5xl font-black tracking-tighter text-transparent bg-clip-text ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-white via-slate-200 to-slate-500"
                    : "bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500"
                }`}
              >
                {formatRupiah(stats.total)}
              </div>
            </div>

            {/* Visualisasi Donut Chart */}
            <div className="hidden sm:block">
              <CategoryDonut
                data={stats.byCategory}
                total={stats.total}
                theme={theme}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {expenses.length} Transaksi
            </span>
            {budget && (
              <span
                className={`text-[10px] font-semibold ${
                  remainingBudget < 0 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {remainingBudget < 0 ? "Over Budget: " : "Sisa: "}
                {formatRupiah(Math.abs(remainingBudget))}
              </span>
            )}
          </div>
        </div>

        {/* Insight / Status Card */}
        <div className={`${cardBaseClass} flex flex-col justify-center`}>
          {isAnomaly ? (
            <div className="flex items-start gap-5">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <AlertCircle className="text-amber-500" size={28} />
              </div>
              <div>
                <h3
                  className={`text-base font-bold ${
                    theme === "dark" ? "text-amber-100" : "text-amber-800"
                  }`}
                >
                  Pola Konsumsi Agresif
                </h3>
                <p
                  className={`mt-2 text-xs font-medium leading-relaxed ${
                    theme === "dark" ? "text-amber-500/80" : "text-amber-700/80"
                  }`}
                >
                  Pengeluaran{" "}
                  <span className="underline decoration-amber-500/50 underline-offset-2">
                    Gaya Hidup
                  </span>{" "}
                  melebihi Kebutuhan Pokok. Disarankan pendinginan aset selama 7
                  hari kedepan.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-5">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle2 className="text-emerald-500" size={28} />
              </div>
              <div>
                <h3
                  className={`text-base font-bold ${
                    theme === "dark" ? "text-emerald-100" : "text-emerald-800"
                  }`}
                >
                  Kesehatan Finansial Optimal
                </h3>
                <p
                  className={`mt-2 text-xs font-medium leading-relaxed ${
                    theme === "dark"
                      ? "text-emerald-500/80"
                      : "text-emerald-700/80"
                  }`}
                >
                  Rasio pengeluaran berada dalam parameter aman. Pertahankan
                  momentum saving rate Anda saat ini.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Budget Monitor Section */}
      {budget && (
        <div className={cardBaseClass}>
          <div className="mb-8 flex items-center justify-between border-b pb-4 border-slate-200/10">
            <h2
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <Target size={14} className="text-purple-400" /> Alokasi Strategis
            </h2>
            <button
              onClick={onEditBudget}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                theme === "dark"
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              Adjust Limit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {(Object.keys(CATEGORIES) as CategoryType[]).map((cat) => (
              <BudgetRow
                key={cat}
                category={cat}
                allocated={budget.allocations[cat] || 0}
                spent={stats.byCategory[cat] || 0}
                theme={theme}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
