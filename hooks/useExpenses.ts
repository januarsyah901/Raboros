import { useState, useEffect } from "react";
import { ExpenseItem } from "../types";

const API_URL = "/api";

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses from database
  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/expenses`);
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error loading expenses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save expenses to database
  const saveExpenses = async (newExpenses: ExpenseItem[]) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpenses),
      });
      if (!response.ok) throw new Error("Failed to save expenses");
      await fetchExpenses();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save";
      setError(errorMsg);
      console.error("Error saving expenses:", err);
      return false;
    }
  };

  // Delete single expense
  const deleteExpense = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete expense");
      await fetchExpenses();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete";
      setError(errorMsg);
      console.error("Error deleting expense:", err);
      return false;
    }
  };

  // Delete all expenses
  const deleteAllExpenses = async () => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete all expenses");
      setExpenses([]);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete";
      setError(errorMsg);
      console.error("Error deleting all expenses:", err);
      return false;
    }
  };

  // Load expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    isLoading,
    error,
    fetchExpenses,
    saveExpenses,
    deleteExpense,
    deleteAllExpenses,
    setExpenses,
  };
};
