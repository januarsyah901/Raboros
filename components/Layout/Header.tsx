import React from "react";
import { Bird, FileText, Trash2, Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface HeaderProps {
  onBudgetClick: () => void;
  onResetClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onBudgetClick,
  onResetClick,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 border-b backdrop-blur-xl ${
        theme === "dark"
          ? "border-slate-800 bg-slate-950/80"
          : "border-slate-200 bg-white/80"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* --- LEFT: LOGO SECTION --- */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-amber-500/30">
            <Bird className="text-white" size={20} />
          </div>
          <div>
            <h1
              className={`text-xl sm:text-2xl font-black leading-none tracking-tighter ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              RABOROS
            </h1>
            <p
              className={`mt-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.25em] ${
                theme === "dark" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Financial Intelligence
            </p>
          </div>
        </div>

        {/* --- RIGHT: ACTIONS SECTION --- */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Budget Button */}
          <button
            onClick={onBudgetClick}
            className={`group flex items-center gap-2 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-2.5 transition-all active:scale-95 ${
              theme === "dark"
                ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                : "border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-md"
            }`}
            title="Atur Budget"
          >
            <FileText
              size={18}
              className="transition-transform duration-300 group-hover:rotate-12"
            />
            <span className="hidden text-xs font-bold uppercase tracking-wider sm:inline">
              Budget
            </span>
          </button>

          {/* 2. Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`rounded-xl p-2.5 transition-all active:scale-95 group ${
              theme === "dark"
                ? "text-slate-400 hover:bg-amber-500/10 hover:text-amber-400"
                : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          >
            {theme === "dark" ? (
              <Sun
                size={20}
                className="transition-transform duration-500 group-hover:rotate-90"
              />
            ) : (
              <Moon
                size={20}
                className="transition-transform duration-500 group-hover:-rotate-12"
              />
            )}
          </button>

          {/* 3. Delete / Clear Button */}
          <button
            onClick={onResetClick}
            className={`group flex items-center gap-2 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-2.5 transition-all active:scale-95 ${
              theme === "dark"
                ? "border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                : "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:shadow-md"
            }`}
            title="Reset Data"
          >
            <Trash2
              size={18}
              className="transition-transform duration-300 group-hover:rotate-12"
            />
            <span className="hidden text-xs font-bold uppercase tracking-wider sm:inline">
              Reset
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
