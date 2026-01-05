import { useState } from "react";
import { ExpenseItem } from "../types";
import { processInput } from "../services/geminiService";

export const useProcessInput = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async (
    input: string | { data: string; mimeType: string }
  ): Promise<ExpenseItem[] | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const newItems = await processInput(input);
      return newItems;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error during process:", err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetError = () => setError(null);

  return {
    isProcessing,
    error,
    handleProcess,
    resetError,
  };
};
