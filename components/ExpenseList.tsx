import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Calendar, Hash, Trash2 } from "lucide-react";
import { ExpenseItem, CategoryType } from "../types";
import { CATEGORIES } from "../constants";
import { useTheme } from "../contexts/ThemeContext";
import { ConfirmModal } from "./ConfirmModal";

interface Props {
  expenses: ExpenseItem[];
  onDelete: (id: string) => void;
}

// Formatter statis agar tidak dire-create setiap render
const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

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

  // Optimasi: Grouping data dilakukan sekali saja menggunakan useMemo
  // Struktur data: { [Category]: { items: [], total: 0 } }
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

    // Sort items by date (newest first) dalam setiap kategori
    Object.keys(groups).forEach((key) => {
      const k = key as CategoryType;
      groups[k]!.items.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return groups;
  }, [expenses]);

  const toggleCategory = (cat: CategoryType) => {
    setExpandedCat(expandedCat === cat ? null : cat);
  };

  return (
    <div className="space-y-4 pb-40">
      {(Object.keys(CATEGORIES) as CategoryType[]).map((cat) => {
        const group = groupedExpenses[cat];

        // Skip render jika tidak ada transaksi di kategori ini
        if (!group) return null;

        const isExpanded = expandedCat === cat;
        const metadata = CATEGORIES[cat];

        return (
          <div
            key={cat}
            className={`
              relative overflow-hidden rounded-[2rem] border transition-all duration-500 ease-out backdrop-blur-md
              ${
                isExpanded
                  ? theme === "dark"
                    ? "bg-slate-900/80 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    : "bg-white border-indigo-400/30"
                  : theme === "dark"
                  ? "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                  : "bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white"
              }
            `}
          >
            {/* Accordion Header */}
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between p-5 group outline-none"
            >
              <div className="flex items-center gap-5">
                {/* Icon Box */}
                <div
                  className={`
                  p-3.5 rounded-2xl border transition-all duration-300
                  ${
                    isExpanded
                      ? "bg-dark-500/20 border-indigo-500/30 text-indigo-300"
                      : theme === "dark"
                      ? "bg-slate-800/50 border-slate-700/50 text-slate-400 group-hover:bg-slate-800"
                      : "bg-slate-100 border-slate-200 text-slate-600 group-hover:bg-slate-200"
                  }
                `}
                >
                  {React.cloneElement(metadata.icon as React.ReactElement, {
                    size: 20,
                  })}
                </div>

                {/* Text Info */}
                <div className="text-left">
                  <h3
                    className={`text-xs font-bold uppercase tracking-[0.15em] transition-colors ${
                      isExpanded
                        ? "text-indigo-200"
                        : theme === "dark"
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    {cat}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-sm font-bold tracking-tight ${
                        theme === "dark" ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {formatter.format(group.total)}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        theme === "dark"
                          ? "text-slate-600 bg-slate-800/50"
                          : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {group.items.length} TX
                    </span>
                  </div>
                </div>
              </div>

              {/* Chevron */}
              <div
                className={`
                p-2 rounded-full border border-transparent transition-all duration-300
                ${
                  isExpanded
                    ? "rotate-180 bg-indigo-500/10 text-indigo-400"
                    : theme === "dark"
                    ? "text-slate-600 group-hover:text-slate-400"
                    : "text-slate-400 group-hover:text-slate-600"
                }
              `}
              >
                <ChevronDown size={18} />
              </div>
            </button>

            {/* Accordion Content */}
            {isExpanded && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                {/* Divider decorative */}
                <div className="w-full px-6">
                  <div
                    className={`h-px w-full border-t border-dashed ${
                      theme === "dark"
                        ? "border-slate-700/50"
                        : "border-slate-300"
                    }`}
                  />
                </div>

                <div className="p-4 space-y-1">
                  {group.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`
                        group/item flex justify-between items-center p-3 rounded-xl 
                        border border-transparent transition-all duration-200
                        ${
                          theme === "dark"
                            ? "hover:bg-white/[0.03] hover:border-white/[0.05]"
                            : "hover:bg-slate-50 hover:border-slate-200"
                        }
                      `}
                    >
                      {/* Left: Item Detail */}
                      <div className="flex-1 pr-4">
                        <span
                          className={`text-sm font-medium block transition-colors ${
                            theme === "dark"
                              ? "text-slate-300 group-hover/item:text-white"
                              : "text-slate-700 group-hover/item:text-slate-900"
                          }`}
                        >
                          {item.item}
                        </span>

                        <div className="flex items-center gap-3 mt-1.5 opacity-60 group-hover/item:opacity-100 transition-opacity">
                          {/* Source Badge */}
                          <div className="flex items-center gap-1.5">
                            <Hash size={10} className="text-indigo-400" />
                            <span
                              className={`text-[10px] font-bold uppercase tracking-widest ${
                                theme === "dark"
                                  ? "text-slate-400"
                                  : "text-slate-500"
                              }`}
                            >
                              {item.source}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] ${
                              theme === "dark"
                                ? "text-slate-700"
                                : "text-slate-400"
                            }`}
                          >
                            •
                          </span>

                          {/* Date Badge */}
                          <div className="flex items-center gap-1.5">
                            <Calendar
                              size={10}
                              className={
                                theme === "dark"
                                  ? "text-slate-500"
                                  : "text-slate-400"
                              }
                            />
                            <span
                              className={`text-[10px] font-semibold uppercase ${
                                theme === "dark"
                                  ? "text-slate-500"
                                  : "text-slate-400"
                              }`}
                            >
                              {new Date(item.date).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price */}
                      <div className="text-right flex items-center gap-3">
                        <span
                          className={`text-sm font-bold font-mono tracking-tight transition-colors ${
                            theme === "dark"
                              ? "text-slate-200 group-hover/item:text-indigo-300"
                              : "text-slate-700 group-hover/item:text-indigo-500"
                          }`}
                        >
                          {formatter.format(item.price)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({
                              isOpen: true,
                              itemName: item.item,
                              itemId: item.id,
                            });
                          }}
                          className={`p-2.5 rounded-xl transition-all duration-300 active:scale-95 group/delete border ${
                            theme === "dark"
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 hover:shadow-[0_0_8px_rgba(244,63,94,0.1)]"
                              : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300 hover:shadow-[0_0_8px_rgba(244,63,94,0.08)]"
                          }`}
                          title="Hapus"
                        >
                          <Trash2 size={15} className="group-hover/delete:rotate-12 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Footer decorative for list */}
                  <div className="pt-2 text-center">
                    <div
                      className={`inline-block h-1 w-8 rounded-full ${
                        theme === "dark" ? "bg-slate-800" : "bg-slate-200"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Hapus Transaksi?"
        message={`Apakah Anda yakin ingin menghapus "${confirmModal.itemName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
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
