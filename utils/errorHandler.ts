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
  isNetworkError: boolean;
  isTimeoutError: boolean;
  userAction?: string; // Suggested action for user
}

/**
 * Extract error message from various error types
 */
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message || error.toString();
  } else if (typeof error === "string") {
    return error;
  } else if (typeof error === "object" && error !== null) {
    const errorObj = error as any;
    if (errorObj.message) {
      return errorObj.message;
    } else if (errorObj.error?.message) {
      return errorObj.error.message;
    } else if (errorObj.error?.status) {
      return `API Error (${errorObj.error.status}): ${
        errorObj.error.message || "Unknown error"
      }`;
    }
  }
  return String(error);
};

/**
 * Parse error from catch block
 */
export const parseError = (error: unknown): ParsedError => {
  const errorStr = extractErrorMessage(error);

  // PRICE VALIDATION ERRORS
  if (
    errorStr.includes("Harga harus") ||
    errorStr.includes("Price must") ||
    errorStr.includes("Invalid price") ||
    (errorStr.includes("harga") &&
      (errorStr.includes("negatif") ||
        errorStr.includes("negative") ||
        errorStr.includes("lebih dari 0") ||
        errorStr.includes("greater than 0") ||
        errorStr.includes("bulat") ||
        errorStr.includes("integer")))
  ) {
    return {
      title: "💰 Input Harga Tidak Valid",
      message: errorStr || "Harga yang Anda masukkan tidak valid.",
      details:
        "Syarat harga yang valid:\n1. Harus berupa angka positif (lebih dari 0)\n2. Tidak boleh negatif\n3. Harus berupa angka bulat\n4. Maksimal Rp 1 miliar\n\nContoh format valid:\n- 25000\n- 25.000\n- Rp 25.000\n- 25k (akan dikonversi menjadi 25.000)",
      isQuotaError: false,
      isAuthError: false,
      isServerError: false,
      isNetworkError: false,
      isTimeoutError: false,
      userAction: "Perbaiki input",
    };
  }

  // BUDGET ALLOCATION ERRORS
  if (errorStr.includes("alokasi") || errorStr.includes("budget")) {
    if (
      errorStr.includes("lebih dari 0") ||
      errorStr.includes("negatif") ||
      errorStr.includes("greater than 0")
    ) {
      return {
        title: "📊 Alokasi Budget Tidak Valid",
        message: errorStr || "Alokasi budget yang Anda masukkan tidak valid.",
        details:
          "Syarat alokasi budget yang valid:\n1. Total alokasi harus lebih dari 0\n2. Setiap kategori tidak boleh negatif\n3. Gunakan angka bulat saja\n\nTips:\n- Pastikan minimal satu kategori memiliki nilai\n- Jangan gunakan nilai negatif\n- Cek kembali setiap input sebelum menyimpan",
        isQuotaError: false,
        isAuthError: false,
        isServerError: false,
        isNetworkError: false,
        isTimeoutError: false,
        userAction: "Perbaiki alokasi",
      };
    }
  }

  // TIMEOUT ERRORS
  if (errorStr.includes("timeout") || errorStr.includes("timed out")) {
    return {
      title: "⏱️ Request Timeout",
      message:
        "Koneksi ke API Gemini terputus atau terlalu lambat. Silakan cek koneksi internet Anda.",
      details:
        "Solusi:\n1. Periksa koneksi internet (WiFi/mobile data)\n2. Coba lagi dalam beberapa saat\n3. Jika masalah berlanjut, mungkin ada gangguan di jaringan atau server",
      isQuotaError: false,
      isAuthError: false,
      isServerError: false,
      isNetworkError: true,
      isTimeoutError: true,
      userAction: "Coba lagi",
    };
  }

  // NETWORK ERRORS
  if (
    errorStr.includes("ECONNREFUSED") ||
    errorStr.includes("ENOTFOUND") ||
    errorStr.includes("Network Error") ||
    errorStr.includes("fetch failed") ||
    errorStr.includes("Failed to fetch")
  ) {
    return {
      title: "🌐 Kesalahan Jaringan",
      message: "Tidak bisa terhubung ke server API Gemini.",
      details:
        "Kemungkinan penyebab:\n1. Koneksi internet tidak stabil\n2. Firewall atau proxy memblokir akses\n3. Server API sedang down\n\nSolusi:\n1. Periksa koneksi internet Anda\n2. Coba lagi dalam beberapa saat\n3. Jika menggunakan VPN/proxy, coba matikan sementara",
      isQuotaError: false,
      isAuthError: false,
      isServerError: false,
      isNetworkError: true,
      isTimeoutError: false,
      userAction: "Coba lagi",
    };
  }

  // QUOTA ERRORS
  if (
    errorStr.includes("429") ||
    errorStr.includes("RESOURCE_EXHAUSTED") ||
    errorStr.includes("QUOTA_EXHAUSTED") ||
    errorStr.includes("rate limit")
  ) {
    const retryMatch = errorStr.match(/Please retry in ([\d.]+)s/);
    const retryTime = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : null;

    return {
      title: "⚠️ Batas Permintaan Tercapai",
      message:
        "Anda telah mencapai batas permintaan gratis Google Gemini (20 permintaan/hari).",
      details: retryTime
        ? `Tunggu ${retryTime} detik sebelum mencoba lagi.\n\nSolusi:\n1. Tunggu hingga quota reset (24 jam)\n2. Upgrade ke API berbayar di console.cloud.google.com\n3. Gunakan API Key atau project GCP yang berbeda`
        : "Solusi:\n1. Tunggu 24 jam untuk reset quota\n2. Upgrade ke API berbayar\n3. Hubungi Google Cloud untuk informasi lebih lanjut",
      isQuotaError: true,
      isAuthError: false,
      isServerError: false,
      isNetworkError: false,
      isTimeoutError: false,
      userAction: "Tunggu dan coba nanti",
    };
  }

  // AUTH ERRORS
  if (
    errorStr.includes("401") ||
    errorStr.includes("403") ||
    errorStr.includes("UNAUTHENTICATED") ||
    errorStr.includes("AUTH_ERROR") ||
    errorStr.includes("invalid API key") ||
    errorStr.includes("API key not valid")
  ) {
    return {
      title: "🔐 API Key Tidak Valid",
      message: "Konfigurasi API Key Gemini tidak benar atau sudah expired.",
      details:
        "Cara memperbaiki:\n1. Buka https://aistudio.google.com/app/apikey\n2. Buat atau copy API Key yang aktif\n3. Update file .env dengan API Key terbaru (GEMINI_API_KEY=xxx)\n4. Restart aplikasi\n\nJika masalah berlanjut, kemungkinan API Key sudah di-revoke atau tidak punya akses ke Gemini API.",
      isQuotaError: false,
      isAuthError: true,
      isServerError: false,
      isNetworkError: false,
      isTimeoutError: false,
      userAction: "Update API Key",
    };
  }

  // SERVER ERRORS (5xx)
  if (
    errorStr.includes("500") ||
    errorStr.includes("502") ||
    errorStr.includes("503") ||
    errorStr.includes("504")
  ) {
    return {
      title: "🔴 Server Error",
      message: "Terjadi kesalahan pada server Gemini API.",
      details:
        "Server API mengalami gangguan sementara.\n\nSolusi:\n1. Tunggu beberapa saat (biasanya 1-5 menit)\n2. Coba lagi\n3. Jika terus error, lapor ke Google Cloud Support",
      isQuotaError: false,
      isAuthError: false,
      isServerError: true,
      isNetworkError: false,
      isTimeoutError: false,
      userAction: "Coba lagi",
    };
  }

  // INVALID JSON RESPONSE
  if (
    errorStr.includes("JSON.parse") ||
    errorStr.includes("Unexpected token")
  ) {
    return {
      title: "📝 Format Response Invalid",
      message: "API mengirim response yang tidak bisa diparsing.",
      details:
        "Ini biasanya error server atau response yang corrupt.\n\nSolusi:\n1. Coba lagi\n2. Jika berlanjut, ada kemungkinan bug di sistem atau API sedang bermasalah",
      isQuotaError: false,
      isAuthError: false,
      isServerError: true,
      isNetworkError: false,
      isTimeoutError: false,
      userAction: "Coba lagi",
    };
  }

  // GENERIC ERROR
  return {
    title: "❌ Terjadi Kesalahan",
    message:
      errorStr || "Sistem mengalami gangguan teknis yang tidak diketahui.",
    details: "Silakan coba lagi atau hubungi support jika masalah berlanjut.",
    isQuotaError: false,
    isAuthError: false,
    isServerError: false,
    isNetworkError: false,
    isTimeoutError: false,
    userAction: "Coba lagi",
  };
};
