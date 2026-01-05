import React, { useRef, useEffect } from "react";
import { Image, Send, Plus, Loader2, MessageCircle } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface InputNavProps {
  isChatMode: boolean;
  isProcessing: boolean;
  inputText: string;
  onInputChange: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onModeToggle: () => void;
  onFileSelect?: (file: File) => void;
}

export const InputNav: React.FC<InputNavProps> = ({
  isChatMode,
  isProcessing,
  inputText,
  onInputChange,
  onSubmit,
  onModeToggle,
  onFileSelect,
}) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 lg:p-8 pointer-events-none">
      <div className="mx-auto max-w-4xl pointer-events-auto flex flex-col items-center gap-4">
        {/* 1. Mode Toggle Pill */}
        <button
          onClick={onModeToggle}
          className={`
            relative flex items-center gap-2 px-6 py-2.5 rounded-full 
            font-black text-[10px] uppercase tracking-[0.25em] 
            shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95
            ${
              isChatMode
                ? "bg-white text-slate-900 ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900"
                : "bg-indigo-600 text-white ring-2 ring-transparent hover:bg-indigo-500"
            }
          `}
        >
          {isChatMode ? (
            <Plus size={14} strokeWidth={3} />
          ) : (
            <MessageCircle size={14} strokeWidth={3} />
          )}
          <span>{isChatMode ? "Input Transaksi" : "Tanya Advisor"}</span>
        </button>

        {/* 2. Main Input Bar */}
        <div
          className={`
            relative w-full flex items-end gap-2 p-2 rounded-[2rem] border shadow-2xl backdrop-blur-2xl transition-all duration-500 ease-out
            ${
              theme === "dark"
                ? "bg-slate-900/80 border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                : "bg-white/80 border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            }
          `}
        >
          {/* Processing Indicator */}
          {isProcessing && (
            <div className="absolute -top-20 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg animate-pulse whitespace-nowrap">
                <Loader2 size={10} className="animate-spin" />
                <span>Memproses Data...</span>
              </div>
            </div>
          )}

          {/* Camera Button (Hidden in Chat Mode) */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              !isChatMode
                ? "w-12 sm:w-14 opacity-100 scale-100"
                : "w-0 opacity-0 scale-95"
            }`}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className={`
                w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-[1.5rem] transition-colors
                ${
                  theme === "dark"
                    ? "bg-slate-800 text-indigo-400 hover:bg-slate-700 hover:text-white"
                    : "bg-slate-100 text-indigo-500 hover:bg-slate-200"
                }
              `}
              title="Scan Struk"
            >
              <Image size={24} />
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {/* Input Form */}
          <form
            onSubmit={onSubmit}
            className="flex-1 flex items-center bg-transparent"
          >
            <input
              type="text"
              placeholder={
                isChatMode
                  ? "Tanya strategi penghematan..."
                  : "Contoh: Nasi Padang 25k (Warung)"
              }
              className={`
                w-full bg-transparent border-none focus:ring-0 py-4 px-3 sm:px-5 
                text-sm sm:text-base font-bold transition-colors
                ${
                  theme === "dark"
                    ? "text-white placeholder:text-slate-500"
                    : "text-slate-900 placeholder:text-slate-400"
                }
              `}
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              disabled={isProcessing}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className={`
                h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 flex items-center justify-center rounded-[1.5rem] transition-all duration-300 transform active:scale-90
                ${
                  !inputText.trim()
                    ? "bg-transparent text-slate-400 cursor-not-allowed"
                    : theme === "dark"
                    ? "bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    : "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]"
                }
              `}
            >
              {isProcessing ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Send
                  size={24}
                  className={inputText.trim() ? "translate-x-0.5" : ""}
                />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
