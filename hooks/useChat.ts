import { useState } from "react";
import { ChatMessage, ExpenseItem } from "../types";
import { askAdvisor } from "../services/geminiService";

export const useChat = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send message to advisor
  const sendMessage = async (message: string, expenses: ExpenseItem[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Add user message
      const userMsg: ChatMessage = { role: "user", text: message };
      setChatHistory((prev) => [...prev, userMsg]);

      // Get AI response
      const response = await askAdvisor(message, expenses);
      const aiMsg: ChatMessage = { role: "model", text: response };
      setChatHistory((prev) => [...prev, aiMsg]);

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error sending message:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setChatHistory([]);
    setError(null);
  };

  // Reset error
  const resetError = () => setError(null);

  return {
    chatHistory,
    isLoading,
    error,
    sendMessage,
    clearChat,
    resetError,
    setChatHistory,
  };
};
