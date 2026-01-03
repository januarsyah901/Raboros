import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Send,
  Plus,
  Loader2,
  Sparkles,
  MessageCircle,
  X,
  LayoutGrid,
  Fingerprint,
  Sun,
  Moon,
} from "lucide-react";
import { ExpenseItem, CategoryType, ChatMessage } from "./types";
import { processInput, askAdvisor } from "./services/geminiService";
import { ExpenseDashboard } from "./components/ExpenseDashboard";
import { ExpenseList } from "./components/ExpenseList";
import { useTheme } from "./contexts/ThemeContext";

const API_URL = "/api";

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load expenses from database
  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatMode]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
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
      console.error(error);
      alert("Sistem Raboros mengalami gangguan teknis.");
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
    <div className="max-w-2xl mx-auto min-h-screen pb-40">
      {/* Dynamic Header */}
      <header
        className={`sticky top-0 z-30 glass-dark px-8 py-6 flex items-center justify-between ${
          theme === "dark"
            ? "border-b border-white/5"
            : "border-b border-slate-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Fingerprint className="text-white" size={24} />
          </div>
          <div>
            <h1
              className={`font-black text-2xl tracking-tighter leading-none ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              RABOROS
            </h1>
            <p
              className={`text-[9px] font-bold uppercase tracking-[0.3em] mt-1 ${
                theme === "dark" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Financial Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all ${
              theme === "dark"
                ? "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-500/10"
            }`}
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => {
              setExpenses([]);
              setChatHistory([]);
            }}
            className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
            title="Reset Data"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <main className="p-8 space-y-10">
        {!isChatMode ? (
          <>
            <ExpenseDashboard expenses={expenses} />
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                    theme === "dark" ? "text-slate-500" : "text-slate-600"
                  }`}
                >
                  <LayoutGrid size={14} /> Log Aktivitas
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
                <ExpenseList expenses={expenses} />
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
      <div className="fixed bottom-0 left-0 right-0 p-8 z-40 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto space-y-6">
          <div className="flex justify-center">
            <button
              onClick={() => setIsChatMode(!isChatMode)}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl premium-shadow ${
                isChatMode
                  ? "bg-white text-slate-950 scale-95"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95"
              }`}
            >
              {isChatMode ? <Plus size={16} /> : <MessageCircle size={16} />}
              {isChatMode ? "Entri Data" : "Strategi AI"}
            </button>
          </div>

          <div className="glass-dark border border-white/10 shadow-2xl rounded-[2.5rem] p-4 flex items-center gap-4">
            {!isChatMode && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="p-5 bg-white/5 hover:bg-white/10 text-indigo-400 rounded-3xl transition-all disabled:opacity-50 border border-white/5"
              >
                <Camera size={26} />
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={onFileChange}
            />

            <form
              onSubmit={onTextSubmit}
              className="flex-1 flex items-center gap-3"
            >
              <input
                type="text"
                placeholder={
                  isChatMode
                    ? "Hubungi Advisor..."
                    : "Ketik belanja (ex: Bakso 25k)"
                }
                className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold py-4 px-2 ${
                  theme === "dark"
                    ? "text-white placeholder:text-slate-600"
                    : "text-slate-900 placeholder:text-slate-400"
                }`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className={`p-5 rounded-3xl transition-all active:scale-90 ${
                  isProcessing
                    ? "bg-slate-800 text-slate-500"
                    : "bg-white text-slate-950 shadow-xl"
                }`}
              >
                {isProcessing ? (
                  <Loader2 size={26} className="animate-spin" />
                ) : (
                  <Send size={26} />
                )}
              </button>
            </form>
          </div>

          {isProcessing && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl animate-pulse">
              Engine Raboros Aktif
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
