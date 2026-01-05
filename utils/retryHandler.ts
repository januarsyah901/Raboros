/**
 * Retry handler dengan exponential backoff dan timeout
 */

export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffFactor?: number;
  timeout?: number; // milliseconds
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  timeout: 30000, // 30 seconds
};

/**
 * Execute function dengan retry logic dan timeout
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | null = null;
  let delay = finalConfig.initialDelay;

  for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
    try {
      // Execute with timeout
      return await withTimeout(fn(), finalConfig.timeout);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (!isRetryable(lastError) || attempt > finalConfig.maxRetries) {
        throw lastError;
      }

      // Calculate delay dengan exponential backoff
      const jitterDelay = delay + Math.random() * delay * 0.1;
      const finalDelay = Math.min(jitterDelay, finalConfig.maxDelay);

      console.warn(
        `⚠️ Attempt ${attempt} failed. Retrying in ${Math.round(
          finalDelay
        )}ms...`
      );
      console.warn(`   Error: ${lastError.message}`);

      await sleep(finalDelay);
      delay = Math.min(delay * finalConfig.backoffFactor, finalConfig.maxDelay);
    }
  }

  throw lastError || new Error("Failed after retries");
};

/**
 * Execute function dengan timeout
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Request timeout after ${timeoutMs}ms. Network might be slow or disconnected.`
        )
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
};

/**
 * Check if error is retryable
 */
export const isRetryable = (error: Error): boolean => {
  const message = error.message.toLowerCase();

  // Network/timeout errors
  if (
    message.includes("timeout") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("network") ||
    message.includes("fetch failed")
  ) {
    return true;
  }

  // Server errors (5xx)
  if (
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504")
  ) {
    return true;
  }

  // Rate limit errors (429)
  if (message.includes("429") || message.includes("rate limit")) {
    return true;
  }

  // Temporarily unavailable
  if (
    message.includes("temporarily unavailable") ||
    message.includes("service unavailable")
  ) {
    return true;
  }

  return false;
};

/**
 * Sleep helper
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
