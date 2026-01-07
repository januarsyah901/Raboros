import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  Calculator,
  PieChart,
} from "lucide-react";
import { CategoryType, Budget } from "../types";
import { CATEGORIES } from "../constants";
import { useTheme } from "../contexts/ThemeContext";
import {
  validatePrice,
  validateBudgetAllocation,
} from "../utils/priceValidator";

interface BudgetAllocationModalProps {
  isOpen: boolean;
  initialBudget?: Budget | null;
  onSubmit: (allocations: Record<CategoryType, number>) => Promise<void>;
  onClose: () => void;
}

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const formatRupiah = (num: number) => formatter.format(num);

// Helper untuk format input (1000000 -> 1.000.000)
const formatNumberInputValue = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const BudgetAllocationModal: React.FC<BudgetAllocationModalProps> = ({
  isOpen,
  initialBudget,
  onSubmit,
  onClose,
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [allocations, setAllocations] = useState<Record<CategoryType, number>>(
    initialBudget?.allocations || {
      [CategoryType.POKOK]: 0,
      [CategoryType.TRANSPORT]: 0,
      [CategoryType.GAYA_HIDUP]: 0,
      [CategoryType.KESEHATAN]: 0,
      [CategoryType.TABUNGAN]: 0,
      [CategoryType.LAINNYA]: 0,
    }
  );

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen && initialBudget) {
      setAllocations(initialBudget.allocations);
    }
  }, [isOpen, initialBudget]);

  const totalBudget = useMemo(
    () =>
      Object.values(allocations).reduce(
        (sum: number, val: number) => sum + val,
        0
      ),
    [allocations]
  );

  const handleInputChange = (category: CategoryType, inputValue: string) => {
    // Hapus semua karakter non-digit untuk mendapatkan raw number
    let numericValue = parseInt(inputValue.replace(/\D/g, "")) || 0;

    // Validasi harga
    const validation = validatePrice(numericValue);
    if (!validation.isValid && numericValue > 0) {
      // Jika tidak valid (bisa negatif atau invalid), set ke 0
      numericValue = 0;
    }

    setAllocations((prev) => ({
      ...prev,
      [category]: numericValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi total budget
    if (totalBudget === 0) {
      setError("Total alokasi harus lebih dari 0");
      return;
    }

    // Validasi setiap kategori tidak boleh negatif
    const budgetValidation = validateBudgetAllocation(allocations);
    if (!budgetValidation.isValid) {
      setError(budgetValidation.error || "Alokasi budget tidak valid");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(allocations);
    } catch (err) {
      setError("Gagal menyimpan alokasi budget");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop dengan Blur */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border shadow-2xl transition-all ${
          theme === "dark"
            ? "border-slate-800 bg-slate-900 text-slate-100"
            : "border-slate-200 bg-white text-slate-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-6 py-5 ${
            theme === "dark"
              ? "border-slate-800 bg-slate-900"
              : "border-slate-100 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl p-2.5 ${
                theme === "dark" ? "bg-slate-800" : "bg-blue-50"
              }`}
            >
              <PieChart
                className={`h-6 w-6 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Alokasi Strategis
              </h2>
              <p
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Atur distribusi keuangan bulanan Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-rose-500/10 p-4 text-rose-500 border border-rose-500/20">
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form id="budget-form" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              {(Object.keys(CATEGORIES) as CategoryType[]).map((category) => {
                const metadata = CATEGORIES[category];
                const value = allocations[category];
                const percentage =
                  totalBudget > 0 ? (value / totalBudget) * 100 : 0;

                return (
                  <div
                    key={category}
                    className={`group rounded-2xl border p-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20 ${
                      theme === "dark"
                        ? "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                        : "border-slate-100 bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <label className="mb-3 flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg shadow-sm ${metadata.color}`}
                      >
                        {metadata.icon}
                      </div>
                      <span className="font-bold text-sm uppercase tracking-wide opacity-80">
                        {category}
                      </span>
                    </label>

                    <div className="relative">
                      <span
                        className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${
                          theme === "dark" ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={value === 0 ? "" : formatNumberInputValue(value)}
                        onChange={(e) =>
                          handleInputChange(category, e.target.value)
                        }
                        placeholder="0"
                        disabled={isLoading}
                        className={`w-full rounded-xl border-none bg-transparent py-2 pl-9 pr-14 text-lg font-bold tabular-nums outline-none transition-all placeholder:text-slate-300 focus:ring-0 ${
                          theme === "dark" ? "text-white" : "text-slate-900"
                        }`}
                      />
                      <div
                        className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-0.5 text-xs font-bold ${
                          theme === "dark"
                            ? "bg-slate-800 text-slate-300"
                            : "bg-white text-slate-600 shadow-sm"
                        }`}
                      >
                        {percentage.toFixed(0)}%
                      </div>
                    </div>

                    {/* Visual Bar inside card */}
                    <div
                      className={`mt-2 h-1 w-full overflow-hidden rounded-full ${
                        theme === "dark" ? "bg-slate-800" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage > 40 ? "bg-blue-500" : "bg-slate-400"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div
          className={`border-t p-6 ${
            theme === "dark"
              ? "border-slate-800 bg-slate-900"
              : "border-slate-100 bg-white"
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  theme === "dark"
                    ? "bg-slate-800 text-slate-400"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Calculator size={24} />
              </div>
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    theme === "dark" ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Total Alokasi
                </p>
                <p
                  className={`text-2xl font-black tracking-tight tabular-nums ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}
                >
                  {formatRupiah(totalBudget)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  theme === "dark"
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                form="budget-form"
                disabled={isLoading || totalBudget === 0}
                className={`flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] ${
                  isLoading || totalBudget === 0
                    ? "cursor-not-allowed bg-slate-400 opacity-50 shadow-none"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    Simpan Alokasi
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
