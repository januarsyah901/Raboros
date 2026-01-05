/**
 * Error handling and parsing utilities
 */

export interface ParsedError {
  title: string;
  message: string;
  details?: string;
  isQuotaError: boolean;
  isAuthError: boolean;
  isServerError: boolean;
}

/**
 * Parse error from catch block
 */
export const parseError = (error: unknown): ParsedError => {
  let errorStr = "";

  if (error instanceof Error) {
    errorStr = error.message || error.toString();
  } else if (typeof error === "string") {
    errorStr = error;
  } else {
    errorStr = String(error);
  }

  // Check error type and return appropriate response
  if (
    errorStr.includes("429") ||
    errorStr.includes("RESOURCE_EXHAUSTED") ||
    errorStr.includes("QUOTA_EXHAUSTED")
  ) {
    const retryMatch = errorStr.match(/Please retry in ([\d.]+)s/);
    const retryTime = retryMatch
      ? Math.ceil(parseFloat(retryMatch[1]))
      : null;

    return {
      title: "⚠️ Quota API Terlampaui",
      message:
        "Anda telah mencapai batas permintaan gratis Google Gemini (20 permintaan per hari).",
      details: retryTime
        ? `Tunggu ${retryTime} detik sebelum mencoba lagi.\n\nSolusi:\n1. Tunggu hingga quota reset (24 jam)\n2. Upgrade ke API berbayar di console.cloud.google.com\n3. Gunakan API Key yang berbeda atau project GCP baru`
        : "Solusi:\n1. Tunggu 24 jam untuk reset quota\n2. Upgrade ke API berbayar\n3. Hubungi Google Cloud untuk informasi lebih lanjut",
      isQuotaError: true,
      isAuthError: false,
      isServerError: false,
    };
  }

  if (
    errorStr.includes("401") ||
    errorStr.includes("UNAUTHENTICATED") ||
    errorStr.includes("AUTH_ERROR")
  ) {
    return {
      title: "❌ API Key Tidak Valid",
      message: "Konfigurasi API Key Gemini tidak benar atau expired.",
      details:
        "Periksa file .env dan pastikan GEMINI_API_KEY sudah benar.\n\nCara fix:\n1. Buka Google AI Studio: https://aistudio.google.com/app/apikey\n2. Buat API Key baru\n3. Update file .env dengan API Key terbaru\n4. Restart aplikasi",
      isQuotaError: false,
      isAuthError: true,
      isServerError: false,
    };
  }

  if (errorStr.includes("500")) {
    return {
      title: "🔴 Server Error",
      message: "Terjadi kesalahan pada server Gemini API.",
      details: "Silakan coba lagi dalam beberapa saat.",
      isQuotaError: false,
      isAuthError: false,
      isServerError: true,
    };
  }

  return {
    title: "Terjadi Kesalahan",
    message: errorStr || "Sistem mengalami gangguan teknis. Silakan coba lagi.",
    isQuotaError: false,
    isAuthError: false,
    isServerError: false,
  };
};
