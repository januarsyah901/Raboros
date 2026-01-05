import { useState, useEffect } from "react";
import { Budget, CategoryType } from "../types";

const API_URL = "/api";

export const useBudget = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch budget from database
  const fetchBudget = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/budget`);
      if (!response.ok) throw new Error("Failed to fetch budget");
      const data = await response.json();
      if (data && data.id) {
        setBudget(data);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error loading budget:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save/update budget
  const saveBudget = async (allocations: Record<CategoryType, number>) => {
    setError(null);
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

      if (!response.ok) throw new Error("Failed to save budget");

      const result = await response.json();
      setBudget(result.budget);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save";
      setError(errorMsg);
      console.error("Error saving budget:", err);
      return false;
    }
  };

  // Calculate remaining budget for category
  const getRemainingBudget = (
    category: CategoryType,
    totalSpent: number
  ): number => {
    if (!budget?.allocations) return 0;
    const allocated = budget.allocations[category] || 0;
    return allocated - totalSpent;
  };

  // Check if budget exceeded
  const isBudgetExceeded = (category: CategoryType, totalSpent: number) => {
    return getRemainingBudget(category, totalSpent) < 0;
  };

  // Load budget on mount
  useEffect(() => {
    fetchBudget();
  }, []);

  return {
    budget,
    isLoading,
    error,
    fetchBudget,
    saveBudget,
    getRemainingBudget,
    isBudgetExceeded,
  };
};
