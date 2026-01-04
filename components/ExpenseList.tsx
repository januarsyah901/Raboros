import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  Calendar,
  Hash,
  Trash2,
  Layers,
  Receipt,
} from "lucide-react";
import { ExpenseItem, CategoryType } from "../types";
import { CATEGORIES } from "../constants";
import { useTheme } from "../contexts/ThemeContext";
import { ConfirmModal } from "./ConfirmModal";

// --- Types & Utils ---
interface Props {
  expenses: ExpenseItem[];
  onDelete: (id: string) => void;
}

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// --- Sub-Component 1: Single Transaction Row ---
const TransactionRow: React.FC<{
  item: ExpenseItem;
  theme: string;
  onRequestDelete: (id: string, name: string) => void;
}> = ({ item, theme, onRequestDelete }) => {
  return (
    <div
      className={`
        group/item relative flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200
        ${
          theme === "dark"
            ? "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/60"
            : "border-slate-100 bg-white hover:border-indigo-100 hover:bg-slate-50 hover:shadow-sm"
        }
      `}
    >
      {/* Left: Icon & Details */}
      <div className="flex items-center gap-4 overflow-hidden">
        {/* Decorative Dot/Line */}
        <div
          className={`h-8 w-1 flex-shrink-0 rounded-full ${
            theme === "dark" ? "bg-slate-700" : "bg-slate-200"
          }`}
        />

        <div className="min-w-0 flex-1">
          <h4
            className={`truncate text-sm font-medium ${
              theme === "dark" ? "text-slate-200" : "text-slate-700"
            }`}
          >
            {item.item}
          </h4>

          {/* Metadata Badges */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 opacity-70 transition-opacity group-hover/item:opacity-100">
            <div className="flex items-center gap-1 rounded-md bg-slate-500/10 px-1.5 py-0.5">
              <Hash size={10} className="text-indigo-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {item.source}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-slate-500/10 px-1.5 py-0.5">
              <Calendar size={10} className="text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-500">
                {new Date(item.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Price & Action */}
      <div className="flex items-center gap-4 pl-4">
        <span
          className={`font-mono text-sm font-bold tracking-tight ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {formatter.format(item.price)}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete(item.id, item.item);
          }}
          className={`
            group/delete flex h-8 w-8 items-center justify-center rounded-lg border transition-all
            ${
              theme === "dark"
                ? "border-transparent bg-slate-800 text-slate-500 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
                : "border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
            }
          `}
          aria-label="Delete transaction"
        >
          <Trash2 size={14} className="transition-transform duration-200 group-hover/delete:rotate-12" />
        </button>
      </div>
    </div>
  );
};

// --- Sub-Component 2: Category Group (Accordion) ---
const CategoryGroup: React.FC<{
  category: CategoryType;
  items: ExpenseItem[];
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: (id: string, name: string) => void;
  theme: string;
}> = ({ category, items, total, isOpen, onToggle, onDelete, theme }) => {
  const metadata = CATEGORIES[category];

  return (
    <div
      className={`
        overflow-hidden rounded-[1.5rem] border transition-all duration-300 ease-in-out
        ${
          isOpen
            ? theme === "dark"
              ? "border-indigo-500/20 bg-slate-900/60 shadow-[0_0_20px_rgba(99,102,241,0.05)]"
              : "border-indigo-200 bg-white shadow-lg shadow-indigo-100/50"
            : theme === "dark"
            ? "border-slate-800 bg-slate-900/20 hover:border-slate-700"
            : "border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white"
        }
      `}
    >
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between px-5 py-4 outline-none"
      >
        <div className="flex items-center gap-4">
          {/* Icon Box */}
          <div
            className={`
            flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors
            ${
              isOpen
                ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-500"
                : theme === "dark"
                ? "border-slate-800 bg-slate-800 text-slate-400 group-hover:text-slate-200"
                : "border-slate-200 bg-slate-100 text-slate-500 group-hover:text-slate-700"
            }
          `}
          >
            {React.cloneElement(metadata.icon as React.ReactElement, {
              size: 20,
            })}
          </div>

          <div className="text-left">
            <h3
              className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                isOpen
                  ? "text-indigo-500"
                  : theme === "dark"
                  ? "text-slate-500"
                  : "text-slate-500"
              }`}
            >
              {category}
            </h3>
            <p
              className={`mt-0.5 text-sm font-bold ${
                theme === "dark" ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {formatter.format(total)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              isOpen
                ? "bg-indigo-500 text-white"
                : theme === "dark"
                ? "bg-slate-800 text-slate-500"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {items.length} TX
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isOpen
                ? "rotate-180 text-indigo-500"
                : theme === "dark"
                ? "text-slate-600"
                : "text-slate-400"
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 px-4 pb-4 pt-0">
            {/* Divider */}
            <div
              className={`mb-4 h-px w-full ${
                theme === "dark" ? "bg-slate-800" : "bg-slate-100"
              }`}
            />
            
            {items.map((item) => (
              <TransactionRow
                key={item.id}
                item={item}
                theme={theme}
                onRequestDelete={onDelete}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export const ExpenseList: React.FC<Props> = ({ expenses, onDelete }) => {
  const { theme } = useTheme();
  const [expandedCat, setExpandedCat] = useState<CategoryType | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    itemName: string;
    itemId: string;
  }>({
    isOpen: false,
    itemName: "",
    itemId: "",
  });

  // Grouping Logic
  const groupedExpenses = useMemo(() => {
    const groups: Partial<
      Record<CategoryType, { items: ExpenseItem[]; total: number }>
    > = {};

    expenses.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = { items: [], total: 0 };
      }
      groups[item.category]!.items.push(item);
      groups[item.category]!.total += item.price;
    });

    Object.keys(groups).forEach((key) => {
      const k = key as CategoryType;
      groups[k]!.items.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return groups;
  }, [expenses]);

  const handleToggle = (cat: CategoryType) => {
    setExpandedCat(expandedCat === cat ? null : cat);
  };

  const handleDeleteRequest = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      itemName: name,
      itemId: id,
    });
  };

  // Empty State
  if (expenses.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-[2rem] border border-dashed py-20 text-center ${
          theme === "dark"
            ? "border-slate-800 bg-slate-900/20"
            : "border-slate-200 bg-slate-50/50"
        }`}
      >
        <div
          className={`mb-4 rounded-full p-4 ${
            theme === "dark" ? "bg-slate-800" : "bg-slate-200"
          }`}
        >
          <Layers size={32} className="text-slate-400" />
        </div>
        <h3
          className={`text-sm font-bold uppercase tracking-widest ${
            theme === "dark" ? "text-slate-500" : "text-slate-600"
          }`}
        >
          Belum Ada Data
        </h3>
        <p className="mt-2 text-xs text-slate-500">
          Mulai tambahkan transaksi untuk melihat analisa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-40">
      {(Object.keys(CATEGORIES) as CategoryType[]).map((cat) => {
        const group = groupedExpenses[cat];
        if (!group) return null;

        return (
          <CategoryGroup
            key={cat}
            category={cat}
            items={group.items}
            total={group.total}
            isOpen={expandedCat === cat}
            onToggle={() => handleToggle(cat)}
            onDelete={handleDeleteRequest}
            theme={theme}
          />
        );
      })}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Hapus Transaksi"
        message={`Hapus permanen "${confirmModal.itemName}" dari catatan?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isDangerous={true}
        onConfirm={() => {
          onDelete(confirmModal.itemId);
          setConfirmModal({ isOpen: false, itemName: "", itemId: "" });
        }}
        onCancel={() =>
          setConfirmModal({ isOpen: false, itemName: "", itemId: "" })
        }
      />
    </div>
  );
};