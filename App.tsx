import React, { useRef, useEffect } from "react";
import { Sparkles, X, Receipt, AlertCircle } from "lucide-react";
import { ExpenseItem, ChatMessage } from "./types";
import { processInput } from "./services/geminiService";
import { ExpenseDashboard } from "./components/ExpenseDashboard";
import { ExpenseList } from "./components/ExpenseList";
import { BudgetAllocationModal } from "./components/BudgetAllocationModal";
import { ConfirmModal } from "./components/ConfirmModal";
import {
  Header,
  MainContent,
  InputNav,
  BackgroundPattern,
} from "./components/Layout";
import { useTheme } from "./contexts/ThemeContext";
import {
  useExpenses,
  useBudget,
  useChat,
  useModals,
  useProcessInput,
} from "./hooks";
import { parseError } from "./utils/errorHandler";

const App: React.FC = () => {
  const { theme } = useTheme();

  // Custom hooks
  const { expenses, saveExpenses, deleteExpense, deleteAllExpenses } =
    useExpenses();
  const { budget, saveBudget } = useBudget();
  const { chatHistory, sendMessage, clearChat } = useChat();
  const { handleProcess } = useProcessInput();
  const {
    showBudgetModal,
    openBudgetModal,
    closeBudgetModal,
    errorModal,
    openErrorModal,
    closeErrorModal,
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
  } = useModals();

  // Local state
  const [isChatMode, setIsChatMode] = React.useState(false);
  const [inputText, setInputText] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
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
            processImageInput({ data: base64, mimeType: blob.type });
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [isChatMode, isProcessing]);

  // Handle budget submission
  const handleBudgetSubmit = async (allocations: Record<string, number>) => {
    const success = await saveBudget(allocations as any);
    if (success) {
      closeBudgetModal();
    } else {
      openErrorModal(
        "Gagal Menyimpan Budget",
        "Terjadi kesalahan saat menyimpan budget. Silakan coba lagi."
      );
    }
  };

  // Handle process input (text or image)
  const processImageInput = async (
    input: string | { data: string; mimeType: string }
  ) => {
    setIsProcessing(true);
    try {
      const newItems = await handleProcess(input);
      if (newItems) {
        await saveExpenses(newItems);
        setInputText("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      const parsed = parseError(error);
      openErrorModal(parsed.title, parsed.message, parsed.details);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle text submit (chat or input)
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      if (isChatMode) {
        const success = await sendMessage(inputText, expenses);
        if (success) {
          setInputText("");
        } else {
          openErrorModal(
            "Gagal Mengirim Pesan",
            "Terjadi kesalahan saat menghubungi AI advisor."
          );
        }
      } else {
        await processImageInput(inputText);
      }
    } catch (error) {
      const parsed = parseError(error);
      openErrorModal(parsed.title, parsed.message, parsed.details);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload
  const handleFileChange = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      await processImageInput({ data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  // Handle delete expense
  const handleDeleteExpense = async (id: string) => {
    openConfirmModal(
      "Hapus Transaksi?",
      "Transaksi ini akan dihapus permanen.",
      async () => {
        const success = await deleteExpense(id);
        if (success) {
          closeConfirmModal();
        }
      }
    );
  };

  // Handle reset all data
  const handleResetAll = () => {
    openConfirmModal(
      "Hapus Semua Data?",
      "Tindakan ini akan menghapus permanen semua catatan pengeluaran, history chat, dan pengaturan budget. Data tidak dapat dipulihkan.",
      async () => {
        await deleteAllExpenses();
        clearChat();
        closeConfirmModal();
      },
      true
    );
  };

  return (
    <BackgroundPattern>
      {/* Header */}
      <Header onBudgetClick={openBudgetModal} onResetClick={handleResetAll} />

      {/* Main Content */}
      <MainContent>
        {!isChatMode ? (
          <>
            <ExpenseDashboard
              expenses={expenses}
              budget={budget}
              onEditBudget={openBudgetModal}
            />
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                    theme === "dark" ? "text-slate-500" : "text-slate-600"
                  }`}
                >
                  <Receipt size={14} /> Riwayat Transaksi
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
                <ExpenseList
                  expenses={expenses}
                  onDelete={handleDeleteExpense}
                />
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
      </MainContent>

      {/* Input Navigation */}
      <InputNav
        isChatMode={isChatMode}
        isProcessing={isProcessing}
        inputText={inputText}
        onInputChange={setInputText}
        onSubmit={handleTextSubmit}
        onModeToggle={() => setIsChatMode(!isChatMode)}
        onFileSelect={handleFileChange}
      />

      {/* Modals */}
      <BudgetAllocationModal
        isOpen={showBudgetModal}
        initialBudget={budget}
        onSubmit={handleBudgetSubmit}
        onClose={closeBudgetModal}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.isDangerous ? "Hapus Semua" : "Hapus"}
        cancelText="Batal"
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

      {/* Error Modal */}
      {errorModal.isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeErrorModal}
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
              onClick={closeErrorModal}
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
              onClick={closeErrorModal}
              className="mt-6 w-full rounded-lg bg-rose-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-rose-600 active:scale-95"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </BackgroundPattern>
  );
};

export default App;
