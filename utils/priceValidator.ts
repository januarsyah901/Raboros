/**
 * Price validation utilities
 */

export interface PriceValidationResult {
  isValid: boolean;
  value?: number;
  error?: string;
}

/**
 * Validate price value
 * - Must be a number
 * - Must be positive (> 0)
 * - Must be an integer
 * - Cannot be NaN or Infinity
 */
export const validatePrice = (value: any): PriceValidationResult => {
  // Check if value is a valid number
  if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
    return {
      isValid: false,
      error: "Harga harus berupa angka yang valid",
    };
  }

  // Check if value is positive
  if (value <= 0) {
    return {
      isValid: false,
      error: "Harga harus lebih dari 0",
    };
  }

  // Check if value is an integer
  if (!Number.isInteger(value)) {
    return {
      isValid: false,
      error: "Harga harus berupa angka bulat (tidak ada desimal)",
    };
  }

  // Check for very large numbers (more than 1 billion)
  if (value > 1000000000) {
    return {
      isValid: false,
      error: "Harga terlalu besar (maksimal Rp 1 miliar)",
    };
  }

  return {
    isValid: true,
    value,
  };
};

/**
 * Validate multiple prices (for bulk operations)
 */
export const validatePrices = (prices: any[]): PriceValidationResult => {
  if (!Array.isArray(prices)) {
    return {
      isValid: false,
      error: "Input harus berupa array",
    };
  }

  for (let i = 0; i < prices.length; i++) {
    const result = validatePrice(prices[i]);
    if (!result.isValid) {
      return {
        isValid: false,
        error: `Item ${i + 1}: ${result.error}`,
      };
    }
  }

  return {
    isValid: true,
  };
};

/**
 * Parse and validate price string input
 * Handles formats like: "25000", "25.000", "Rp 25.000", "25k", "0.5j" (500k)
 */
export const parsePriceString = (input: string): PriceValidationResult => {
  if (!input || typeof input !== "string") {
    return {
      isValid: false,
      error: "Input harga tidak valid",
    };
  }

  // Remove whitespace
  let normalized = input.trim();

  // Remove common currency symbols
  normalized = normalized
    .replace(/^Rp\.?\s*/i, "") // Remove "Rp" or "Rp."
    .replace(/^IDR\.?\s*/i, "") // Remove "IDR"
    .replace(/[,.\s]/g, "") // Remove dots, commas, spaces
    .trim();

  // Handle shorthand notations (k = ribu, j = juta, m = juta)
  if (normalized.match(/^(\d+(?:\.\d+)?)[kK]$/)) {
    // "25k" -> 25000
    const num = parseFloat(normalized);
    normalized = String(Math.floor(num * 1000));
  } else if (normalized.match(/^(\d+(?:\.\d+)?)[jJ]$/)) {
    // "2.5j" or "2.5jt" -> 2500000
    const num = parseFloat(normalized);
    normalized = String(Math.floor(num * 1000000));
  } else if (normalized.match(/^(\d+(?:\.\d+)?)[mM]$/)) {
    // "2.5m" -> 2500000
    const num = parseFloat(normalized);
    normalized = String(Math.floor(num * 1000000));
  }

  // Extract only digits
  const digitsOnly = normalized.replace(/\D/g, "");

  if (!digitsOnly) {
    return {
      isValid: false,
      error:
        "Harga tidak ditemukan. Gunakan format: 25000 atau 25k atau Rp 25.000",
    };
  }

  const price = parseInt(digitsOnly, 10);

  return validatePrice(price);
};

/**
 * Sanitize price value (remove invalid values)
 */
export const sanitizePrice = (value: any, defaultValue: number = 0): number => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  return defaultValue;
};

/**
 * Check if budget allocation is valid
 */
export const validateBudgetAllocation = (
  allocation: Record<string, number>
): PriceValidationResult => {
  const total = Object.values(allocation).reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  if (total <= 0) {
    return {
      isValid: false,
      error: "Total alokasi budget harus lebih dari 0",
    };
  }

  // Check each category
  for (const [category, value] of Object.entries(allocation)) {
    if (typeof value === "number" && value < 0) {
      return {
        isValid: false,
        error: `Alokasi untuk ${category} tidak boleh negatif`,
      };
    }
  }

  return {
    isValid: true,
    value: total,
  };
};
