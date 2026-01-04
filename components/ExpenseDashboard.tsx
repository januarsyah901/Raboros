import React, { useMemo } from "react";
import {
  Wallet,
  AlertCircle,
  Target,
  Zap,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { ExpenseItem, CategoryType, Budget } from "../types";
import { CATEGORIES } from "../constants";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  expenses: ExpenseItem[];
  budget?: Budget | null;
  onEditBudget?: () => void;
}

// Formatter dipisah agar tidak dibuat ulang setiap render
const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatRupiah = (number: number) => formatter.format(number);

export const ExpenseDashboard: React.FC<Props> = ({
  expenses,
  budget,
  onEditBudget,
}) => {
  const { theme } = useTheme();

  // Optimasi 1: Hitung semua data dalam satu kali pass (Single Pass Loop)
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

  return (
    <div className="space-y-6">
      {/* Total Card - Visual Upgrade */}
      <div
        className={`rounded-[2.5rem] p-8 border transition-colors ${
          theme === "dark"
            ? "border-slate-800 bg-slate-900/50"
            : "border-slate-200 bg-white"
        }`}
      >
        {/* Header: Label & Counter */}
        <div className="flex items-center justify-between mb-6">
          <h1
            className={`text-xs font-bold uppercase tracking-[0.2em] ${
              theme === "dark" ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Total Ekosistem
          </h1>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
            {expenses.length} OPS
          </span>
        </div>

        {/* Main Value */}
        <div
          className={`text-5xl font-black tracking-tighter text-transparent bg-clip-text ${
            theme === "dark"
              ? "bg-gradient-to-br from-white via-slate-200 to-slate-600"
              : "bg-gradient-to-br from-slate-900 via-slate-700 to-slate-400"
          }`}
        >
          {formatRupiah(stats.total)}
        </div>

        {/* Footer Text */}
        <div
          className={`mt-6 text-[10px] font-semibold uppercase tracking-widest ${
            theme === "dark" ? "text-slate-700" : "text-slate-400"
          }`}
        >
          Financial Overview • Raboros Intel
        </div>
      </div>
      {/* Budget Monitor - Strategic Allocation */}
      {budget && (
        <div
          className={`rounded-[2.5rem] p-8 backdrop-blur-md ${
            theme === "dark"
              ? "border border-slate-800 bg-slate-950/40"
              : "border border-slate-200 bg-white/60"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <h2
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <Target size={14} className="text-purple-400" /> Alokasi Strategis
            </h2>
            <button
              onClick={onEditBudget}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Edit
            </button>
          </div>

          <div className="space-y-7">
            {(Object.keys(CATEGORIES) as CategoryType[]).map((cat) => {
              const allocated = budget.allocations[cat] || 0;
              const spent = stats.byCategory[cat] || 0;
              const remaining = allocated - spent;
              // Hitung persentase tapi cap di 100 untuk width bar, tapi biarkan text real
              const percentReal = allocated > 0 ? (spent / allocated) * 100 : 0;
              const percentBar = Math.min(percentReal, 100);
              const isOverBudget = spent > allocated;
              const metadata = CATEGORIES[cat];

              return (
                <div key={cat} className="group relative">
                  <div className="mb-2 flex items-end justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isOverBudget ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest ${
                            theme === "dark"
                              ? "text-slate-500"
                              : "text-slate-600"
                          }`}
                        >
                          {cat}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-sm font-bold ${
                            theme === "dark"
                              ? "text-slate-200"
                              : "text-slate-800"
                          }`}
                        >
                          {formatRupiah(spent)}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            theme === "dark"
                              ? "text-slate-600"
                              : "text-slate-400"
                          }`}
                        >
                          / {formatRupiah(allocated)}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-right ${
                        isOverBudget ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      <span className="block text-lg font-black">
                        {percentReal.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div
                    className={`h-2 w-full overflow-hidden rounded-full p-[2px] ${
                      theme === "dark" ? "bg-slate-800/50" : "bg-slate-200"
                    }`}
                  >
                    <div
                      style={{ width: `${percentBar}%` }}
                      className={`h-full rounded-full transition-all duration-1000 ease-out 
                           ${
                             isOverBudget
                               ? "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                               : "bg-gradient-to-r from-indigo-500 to-purple-500"
                           }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insight Section (Dynamic) */}
      {isAnomaly ? (
        <div className="flex items-start gap-5 rounded-[2rem] border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-sm transition-all hover:bg-amber-500/10">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <AlertCircle className="text-amber-400" size={24} />
          </div>
          <div>
            <h3
              className={`text-sm font-bold ${
                theme === "dark" ? "text-amber-200" : "text-amber-700"
              }`}
            >
              Anomali Terdeteksi
            </h3>
            <p
              className={`mt-1 text-xs font-medium leading-relaxed ${
                theme === "dark" ? "text-amber-500/80" : "text-amber-600"
              }`}
            >
              Pengeluaran{" "}
              <span
                className={
                  theme === "dark"
                    ? "text-amber-300"
                    : "text-amber-700 font-bold"
                }
              >
                Gaya Hidup
              </span>{" "}
              mendominasi struktur keuangan. Disarankan untuk meninjau ulang
              prioritas Raboros Advisor.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-5 rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-sm">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <CheckCircle2 className="text-emerald-400" size={24} />
          </div>
          <div>
            <h3
              className={`text-sm font-bold ${
                theme === "dark" ? "text-emerald-200" : "text-emerald-700"
              }`}
            >
              Kondisi Stabil
            </h3>
            <p
              className={`mt-1 text-xs font-medium leading-relaxed ${
                theme === "dark" ? "text-emerald-500/80" : "text-emerald-600"
              }`}
            >
              Struktur pengeluaran Anda berada dalam parameter aman. Pertahankan
              keseimbangan antara Kebutuhan Pokok dan Gaya Hidup.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
