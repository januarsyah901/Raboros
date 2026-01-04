import React, { useState, useRef, useEffect } from "react";
import {
  Image,
  Send,
  Plus,
  Loader2,
  Sparkles,
  MessageCircle,
  X,
  Receipt,
  FileText,
  Sun,
  Moon,
  Bird,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { ExpenseItem, CategoryType, ChatMessage, Budget } from "./types";
import { processInput, askAdvisor } from "./services/geminiService";
import { ExpenseDashboard } from "./components/ExpenseDashboard";
import { ExpenseList } from "./components/ExpenseList";
import { BudgetAllocationModal } from "./components/BudgetAllocationModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { useTheme } from "./contexts/ThemeContext";

const API_URL = "/api";

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDangerous?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load expenses from database
  useEffect(() => {
    fetchExpenses();
    fetchBudget();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatMode]);

  // Handle paste event for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (isChatMode || isProcessing) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (!blob) continue;

          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = (reader.result as string).split(",")[1];
            handleProcess({ data: base64, mimeType: blob.type });
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [isChatMode, isProcessing]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  };

  const fetchBudget = async () => {
    try {
      const response = await fetch(`${API_URL}/budget`);
      const data = await response.json();
      if (data && data.id) {
        setBudget(data);
      }
    } catch (error) {
      console.error("Error loading budget:", error);
    }
  };

  const handleBudgetSubmit = async (
    allocations: Record<CategoryType, number>
  ) => {
    try {
      const totalBudget = Object.values(allocations).reduce(
        (sum: number, val: number) => sum + val,
        0
      );
      const newBudget: Budget = {
        id: budget?.id || "",
        total_budget: totalBudget,
        allocations: allocations,
        created_at: budget?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(`${API_URL}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBudget),
      });

      if (response.ok) {
        const savedBudget = await response.json();
        setBudget(savedBudget.budget);
        setShowBudgetModal(false);
      } else {
        alert("Gagal menyimpan budget. Coba lagi");
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("Gagal menyimpan budget");
    }
  };

  const saveExpenses = async (newExpenses: ExpenseItem[]) => {
    try {
      await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpenses),
      });
      await fetchExpenses();
    } catch (error) {
      console.error("Error saving expenses:", error);
      alert("Gagal menyimpan data ke database");
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
      });
      await fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      setConfirmModal({
        isOpen: true,
        title: "Gagal Menghapus",
        message: "Terjadi kesalahan saat menghapus data. Silakan coba lagi.",
        onConfirm: () => setConfirmModal({ ...confirmModal, isOpen: false }),
        isDangerous: false,
      });
    }
  };

  const handleProcess = async (
    input: string | { data: string; mimeType: string }
  ) => {
    setIsProcessing(true);
    try {
      if (isChatMode && typeof input === "string") {
        const userMsg: ChatMessage = { role: "user", text: input };
        setChatHistory((prev) => [...prev, userMsg]);
        setInputText("");

        const response = await askAdvisor(input, expenses);
        const aiMsg: ChatMessage = { role: "model", text: response };
        setChatHistory((prev) => [...prev, aiMsg]);
      } else {
        const newItems = await processInput(input);
        await saveExpenses(newItems);
        setInputText("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error during process:", error);

      // Parse error message
      let errorTitle = "Terjadi Kesalahan";
      let errorMessage = "Sistem mengalami gangguan teknis. Silakan coba lagi.";
      let errorDetails = "";

      if (error instanceof Error) {
        const errorStr = error.message || error.toString();

        // Handle Gemini API errors - enhanced detection
        if (
          errorStr.includes("429") ||
          errorStr.includes("RESOURCE_EXHAUSTED") ||
          errorStr.includes("QUOTA_EXHAUSTED")
        ) {
          errorTitle = "⚠️ Quota API Terlampaui";
          errorMessage =
            "Anda telah mencapai batas permintaan gratis Google Gemini (20 permintaan per hari).";

          // Extract retry time if available
          const retryMatch = errorStr.match(/Please retry in ([\d.]+)s/);
          const retryTime = retryMatch
            ? Math.ceil(parseFloat(retryMatch[1]))
            : null;

          errorDetails = retryTime
            ? `Tunggu ${retryTime} detik sebelum mencoba lagi.\n\nSolusi:\n1. Tunggu hingga quota reset (24 jam)\n2. Upgrade ke API berbayar di console.cloud.google.com\n3. Gunakan API Key yang berbeda atau project GCP baru`
            : "Solusi:\n1. Tunggu 24 jam untuk reset quota\n2. Upgrade ke API berbayar\n3. Hubungi Google Cloud untuk informasi lebih lanjut";
        } else if (
          errorStr.includes("401") ||
          errorStr.includes("UNAUTHENTICATED") ||
          errorStr.includes("AUTH_ERROR")
        ) {
          errorTitle = "❌ API Key Tidak Valid";
          errorMessage = "Konfigurasi API Key Gemini tidak benar atau expired.";
          errorDetails =
            "Periksa file .env dan pastikan GEMINI_API_KEY sudah benar.\n\nCara fix:\n1. Buka Google AI Studio: https://aistudio.google.com/app/apikey\n2. Buat API Key baru\n3. Update file .env dengan API Key terbaru\n4. Restart aplikasi";
        } else if (errorStr.includes("500")) {
          errorTitle = "🔴 Server Error";
          errorMessage = "Terjadi kesalahan pada server Gemini API.";
          errorDetails = "Silakan coba lagi dalam beberapa saat.";
        } else {
          errorMessage = errorStr;
        }
      }

      setErrorModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
        details: errorDetails,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    handleProcess(inputText);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      handleProcess({ data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`relative min-h-screen pb-40 ${
        theme === "dark" ? "bg-slate-950" : "bg-white"
      }`}
    >
      {/* Background SVG Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          style={{ opacity: theme === "dark" ? 0.08 : 0.04 }}
        >
          {/* Gradient Definition */}
          <defs>
            <radialGradient id="grad1" cx="20%" cy="20%">
              <stop
                offset="0%"
                stopColor={theme === "dark" ? "#60a5fa" : "#3b82f6"}
              />
              <stop
                offset="100%"
                stopColor={theme === "dark" ? "#1e1b4b" : "#ffffff"}
              />
            </radialGradient>
          </defs>

          {/* Decorative circles and waves */}
          <circle cx="200" cy="150" r="300" fill="url(#grad1)" />
          <circle cx="1000" cy="600" r="350" fill="url(#grad1)" />

          {/* Wave pattern */}
          <path
            d="M 0,300 Q 300,250 600,300 T 1200,300 L 1200,800 L 0,800 Z"
            fill={theme === "dark" ? "#4f46e5" : "#93c5fd"}
            opacity="0.5"
          />

          {/* Additional decorative elements */}
          <path
            d="M 0,400 Q 300,350 600,400 T 1200,400"
            stroke={theme === "dark" ? "#818cf8" : "#60a5fa"}
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Main Content Container */}
      <div className="relative z-0 max-w-5xl mx-auto">
        {/* Dynamic Header */}
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
                onClick={() => setShowBudgetModal(true)}
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
                {/* Text hidden on mobile, visible on sm+ */}
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
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: "Hapus Semua Data?",
                    message:
                      "Tindakan ini akan menghapus permanen semua catatan pengeluaran, history chat, dan pengaturan budget. Data tidak dapat dipulihkan.",
                    onConfirm: () => {
                      setExpenses([]);
                      setChatHistory([]);
                      setConfirmModal({ ...confirmModal, isOpen: false });
                      fetch(`${API_URL}/expenses`, { method: "DELETE" }).catch(
                        console.error
                      );
                    },
                    isDangerous: true,
                  });
                }}
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
                {/* Text hidden on mobile, visible on sm+ */}
                <span className="hidden text-xs font-bold uppercase tracking-wider sm:inline">
                  Reset
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-10">
          {!isChatMode ? (
            <>
              <ExpenseDashboard
                expenses={expenses}
                budget={budget}
                onEditBudget={() => setShowBudgetModal(true)}
              />
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                      theme === "dark" ? "text-slate-500" : "text-slate-600"
                    }`}
                  >
                    <Receipt size={14} /> Riwayat Transaksi{" "}
                  </h2>
                </div>
                {expenses.length === 0 ? (
                  <div
                    className={`glass-dark rounded-[2.5rem] p-16 text-center border-dashed border-2 ${
                      theme === "dark" ? "border-white/5" : "border-slate-200"
                    }`}
                  >
                    <p
                      className={`font-bold text-sm tracking-wide ${
                        theme === "dark" ? "text-slate-500" : "text-slate-600"
                      }`}
                    >
                      Data Log Kosong
                    </p>
                    <p
                      className={`text-[10px] mt-2 uppercase tracking-widest font-semibold ${
                        theme === "dark" ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      Ready for initialization...
                    </p>
                  </div>
                ) : (
                  <ExpenseList expenses={expenses} onDelete={deleteExpense} />
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6 min-h-[70vh] flex flex-col pt-4">
              <div
                className={`flex items-center justify-between p-5 rounded-3xl border ${
                  theme === "dark"
                    ? "bg-indigo-500/10 border-indigo-500/20"
                    : "bg-indigo-50 border-indigo-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Sparkles className="text-indigo-400" size={20} />
                  <div
                    className={`text-sm font-bold tracking-wide uppercase ${
                      theme === "dark" ? "text-indigo-100" : "text-indigo-700"
                    }`}
                  >
                    Raboros Advisor
                  </div>
                </div>
                <button
                  onClick={() => setIsChatMode(false)}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto max-h-[60vh] px-2">
                {chatHistory.length === 0 && (
                  <div
                    className={`text-center py-20 ${
                      theme === "dark" ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    <Sparkles size={40} className="mx-auto mb-6 opacity-20" />
                    <p className="text-sm font-bold tracking-wide">
                      Menganalisis profil keuangan Anda...
                    </p>
                    <p
                      className={`text-xs font-medium mt-2 italic ${
                        theme === "dark" ? "text-slate-700" : "text-slate-500"
                      }`}
                    >
                      "Tanyakan strategi penghematan Anda"
                    </p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-5 rounded-[1.8rem] text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20 font-medium"
                          : theme === "dark"
                          ? "glass-dark text-slate-200 rounded-tl-none border-white/10"
                          : "bg-white text-slate-700 rounded-tl-none border border-slate-200 shadow-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}
        </main>

        {/* Futuristic Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 lg:p-8 pointer-events-none">
          {/* Container Utama: Lebar disesuaikan agar tidak terlalu kecil di desktop */}
          <div className="mx-auto max-w-4xl pointer-events-auto flex flex-col items-center gap-4">
            {/* 1. Mode Toggle Pill (Floating Top) */}
            {/* Tombol ini memberi tahu user konteks apa yang sedang aktif */}
            <button
              onClick={() => setIsChatMode(!isChatMode)}
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
              {/* Processing Indicator (Absolute Badge) */}
              {isProcessing && (
                <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg animate-pulse whitespace-nowrap">
                    <Loader2 size={10} className="animate-spin" />
                    <span>Memproses Data...</span>
                  </div>
                </div>
              )}

              {/* Camera Button (Hanya muncul di mode Input) */}
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
                onChange={onFileChange}
              />

              {/* Input Form Area */}
              <form
                onSubmit={onTextSubmit}
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
                  onChange={(e) => setInputText(e.target.value)}
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

        {/* Budget Allocation Modal */}
        <BudgetAllocationModal
          isOpen={showBudgetModal}
          initialBudget={budget}
          onSubmit={handleBudgetSubmit}
          onClose={() => setShowBudgetModal(false)}
        />

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.isDangerous ? "Hapus Semua" : "Hapus"}
          cancelText="Batal"
          isDangerous={confirmModal.isDangerous}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        />

        {/* Error Modal */}
        {errorModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
            />

            {/* Modal */}
            <div
              className={`relative z-10 w-full max-w-sm rounded-[2rem] border p-6 shadow-2xl transition-all ${
                theme === "dark"
                  ? "bg-slate-900 border-rose-800/50"
                  : "bg-white border-rose-200"
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                className={`absolute right-4 top-4 p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
              >
                <X size={20} />
              </button>

              {/* Error Icon */}
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-rose-500/10 p-4">
                  <AlertCircle className="text-rose-500" size={40} />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-center text-lg font-bold text-rose-600 dark:text-rose-400">
                {errorModal.title}
              </h2>

              {/* Message */}
              <p
                className={`mt-3 text-center text-sm leading-relaxed ${
                  theme === "dark" ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {errorModal.message}
              </p>

              {/* Details */}
              {errorModal.details && (
                <div
                  className={`mt-4 p-4 rounded-lg text-sm whitespace-pre-wrap ${
                    theme === "dark"
                      ? "bg-slate-800/50 text-slate-300"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {errorModal.details}
                </div>
              )}

              {/* Button */}
              <button
                onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                className="mt-6 w-full rounded-lg bg-rose-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-rose-600 active:scale-95"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
