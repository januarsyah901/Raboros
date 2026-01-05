import { useState } from "react";
import { ExpenseItem } from "../types";
import { processInput } from "../services/geminiService";
import { parseError } from "../utils/errorHandler";

export interface ProcessError {
  title: string;
  message: string;
  details?: string;
  userAction?: string;
  isQuotaError: boolean;
  isAuthError: boolean;
  isServerError: boolean;
  isNetworkError: boolean;
  isTimeoutError: boolean;
}

export const useProcessInput = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ProcessError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleProcess = async (
    input: string | { data: string; mimeType: string }
  ): Promise<ExpenseItem[] | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const newItems = await processInput(input);
      setRetryCount(0); // Reset retry count on success
      return newItems;
    } catch (err) {
      // Parse error to get detailed error info
      const parsedError = parseError(err);
      setError(parsedError as ProcessError);
      console.error("Error during process:", err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetError = () => {
    setError(null);
    setRetryCount(0);
  };

  const retry = async (
    input: string | { data: string; mimeType: string }
  ): Promise<ExpenseItem[] | null> => {
    setRetryCount((prev) => prev + 1);
    return handleProcess(input);
  };

  return {
    isProcessing,
    error,
    retryCount,
    handleProcess,
    resetError,
    retry,
  };
};
