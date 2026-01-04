import React from "react";
import { AlertCircle, X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Hapus",
  cancelText = "Batal",
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-sm rounded-[2rem] border p-6 shadow-2xl transition-all ${
          theme === "dark"
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className={`absolute right-4 top-4 p-2 rounded-lg transition-colors ${
            theme === "dark"
              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          }`}
        >
          <X size={20} />
        </button>

        {/* Icon */}
        {isDangerous && (
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-rose-500/10 p-3">
              <AlertCircle className="text-rose-500" size={32} />
            </div>
          </div>
        )}

        {/* Title */}
        <h2
          className={`text-center text-lg font-bold ${
            isDangerous
              ? "text-rose-600 dark:text-rose-400"
              : theme === "dark"
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          className={`mt-3 text-center text-sm leading-relaxed ${
            theme === "dark" ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition-colors ${
              theme === "dark"
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-2.5 font-medium text-white transition-colors ${
              isDangerous
                ? "bg-rose-500 hover:bg-rose-600 active:scale-95"
                : "bg-indigo-500 hover:bg-indigo-600 active:scale-95"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
