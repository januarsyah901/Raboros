import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseItem, CategoryType, ChatMessage } from "../types";
import { withRetry, isRetryable } from "../utils/retryHandler";
import { parseError } from "../utils/errorHandler";
import { validatePrice } from "../utils/priceValidator";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Schema untuk structured output Raboros Intelligence
 */
const EXPENSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      item: {
        type: Type.STRING,
        description: "Nama barang atau layanan yang dibeli",
      },
      price: {
        type: Type.NUMBER,
        description: "Harga dalam Rupiah (integer, tanpa desimal)",
      },
      category: {
        type: Type.STRING,
        description:
          "Kategori pengeluaran: 'Kebutuhan Pokok', 'Transportasi & Servis', 'Gaya Hidup', 'Kesehatan', 'Investasi & Tabungan', atau 'Lainnya'",
        enum: [
          "Kebutuhan Pokok",
          "Transportasi & Servis",
          "Gaya Hidup",
          "Kesehatan",
          "Investasi & Tabungan",
          "Lainnya",
        ],
      },
      source: {
        type: Type.STRING,
        description: "Nama toko, merchant, bengkel, atau lokasi transaksi",
      },
    },
    required: ["item", "price", "category", "source"],
  },
};

/**
 * Prompt template yang dioptimalkan untuk Raboros Intelligence
 */
const RABOROS_PROMPT = `Kamu adalah Raboros Intelligence - sistem analisis keuangan elit dengan presisi tingkat tinggi.

TUGAS: Analisis struk atau teks pembelian dan ekstrak setiap item dengan detail berikut:
- Item: Nama barang/layanan
- Harga: Konversi ke integer Rupiah (hapus semua simbol, titik, koma)
- Kategori: Klasifikasi KETAT berdasarkan aturan di bawah
- Sumber: Nama toko/merchant

═══════════════════════════════════════════════════════════════════
SISTEM KATEGORISASI RABOROS (WAJIB DIIKUTI):
═══════════════════════════════════════════════════════════════════

1. 'Kebutuhan Pokok' →
   ✓ Makanan pokok: nasi, mie, roti, telur, susu
   ✓ Sembako: beras, minyak, gula, garam, bumbu
   ✓ Bahan makanan: sayur, buah, daging, ikan, ayam, tahu, tempe
   ✓ Waktu makan: sarapan, makan siang, makan malam
   ✓ Tempat: warteg, kantin, pasar tradisional
   ⚠️ PENTING: Makanan di warteg/kantin = Kebutuhan Pokok (bukan Gaya Hidup)
   ✓ Tempat tinggal: bayar kos, sewa kos, kontrakan, kontrak kamar
   ✓ Utilitas: listrik, air, wifi, internet, pulsa, paket data
   ✓ Kebutuhan kuliah: buku, fotokopi, print, jilid, alat tulis, materai
   ✓ Organisasi: iuran himpunan, kepanitiaan, proker, kas kelas
   ⚠️ PENTING: Bayar kos, listrik, air, wifi = WAJIB kategori ini
   ⚠️ PENTING: Print/fotokopi untuk kuliah = Pendidikan (bukan Gaya Hidup)

2. 'Transportasi & Servis' →
   ✓ BBM: bensin, pertamax, pertalite, solar
   ✓ Transportasi online: grab, gojek, ojek, taksi
   ✓ Perawatan: service motor/mobil, cuci kendaraan
   ✓ Infrastruktur: parkir, tol, retribusi

3. 'Gaya Hidup' →
   ✓ F&B premium: kafe, coffee shop, restoran, fine dining
   ✓ Hiburan: bioskop, konser, streaming, game
   ✓ Fashion: baju, sepatu, tas, aksesoris
   ✓ Hobi & lifestyle: gym, spa, salon, shopping mall

4. 'Kesehatan' →
   ✓ Medis: dokter, rumah sakit, klinik, lab
   ✓ Farmasi: obat, vitamin, suplemen, alat kesehatan
   ✓ Preventif: medical checkup, vaksin, terapi

5. 'Investasi & Tabungan' →
   ✓ Tabungan: nabung, menabung, setor tabungan
   ✓ Investasi: reksadana, saham, obligasi, emas
   ✓ Asuransi: premi asuransi jiwa/kesehatan
   ✓ Deposito, P2P lending, cryptocurrency
   ⚠️ PENTING: Kata kunci 'nabung', 'menabung', 'investasi', 'invest' = WAJIB kategori ini

6. 'Lainnya' →
   ✓ Segala yang tidak masuk 5 kategori di atas
   ✓ Donasi, hadiah, keperluan tak terduga

═══════════════════════════════════════════════════════════════════
ATURAN KONVERSI HARGA:
═══════════════════════════════════════════════════════════════════
- Hapus: Rp, IDR, $, titik (.), koma (,), spasi
- Contoh: "Rp 15.000" → 15000
- Contoh: "Rp. 1.250.500,-" → 1250500
- Contoh: "35k" → 35000

═══════════════════════════════════════════════════════════════════
CONTOH ANALISIS:
═══════════════════════════════════════════════════════════════════
Input: "Nasi Goreng Warteg Rp 12.000"
Output: {
  item: "Nasi Goreng",
  price: 12000,
  category: "Kebutuhan Pokok",
  source: "Warteg"
}

Input: "Kopi Latte Starbucks 45rb"
Output: {
  item: "Kopi Latte",
  price: 45000,
  category: "Gaya Hidup",
  source: "Starbucks"
}

Input: "Nabung 500ribu"
Output: {
  item: "Tabungan Rutin",
  price: 500000,
  category: "Investasi & Tabungan",
  source: "Bank"
}

Analisis dengan presisi maksimal. Kembalikan JSON array yang valid.`;

/**
 * Process input text atau gambar untuk ekstraksi pengeluaran
 */
export const processInput = async (
  input: string | { data: string; mimeType: string }
): Promise<ExpenseItem[]> => {
  const model = "gemini-3-flash-preview";

  const contents =
    typeof input === "string"
      ? RABOROS_PROMPT + "\n\n═══ INPUT PENGGUNA ═══\n" + input
      : {
          parts: [{ text: RABOROS_PROMPT }, { inlineData: input }],
        };

  try {
    const results = await withRetry(
      async () => {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: EXPENSE_SCHEMA,
            temperature: 0.1, // Low temperature untuk konsistensi kategorisasi
          },
        });

        return JSON.parse(response.text || "[]");
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        timeout: 30000,
      }
    );

    // Validasi dan enrichment
    return results
      .map((res: any) => {
        // Validasi harga
        const priceValidation = validatePrice(res.price);
        if (!priceValidation.isValid) {
          console.warn(
            `⚠️ Invalid price for "${res.item}": ${res.price} - ${priceValidation.error}`
          );
          return null; // Skip invalid entries
        }

        const validCategories: CategoryType[] = [
          CategoryType.POKOK,
          CategoryType.TRANSPORT,
          CategoryType.GAYA_HIDUP,
          CategoryType.KESEHATAN,
          CategoryType.TABUNGAN,
          CategoryType.LAINNYA,
        ];

        const category = validCategories.includes(res.category)
          ? res.category
          : CategoryType.LAINNYA;

        return {
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString(),
          item: res.item || "Tidak Diketahui",
          price: Math.round(priceValidation.value!), // Validated price
          category: category as CategoryType,
          source: res.source || "Tidak Diketahui",
        };
      })
      .filter((item) => item !== null) as ExpenseItem[];
  } catch (error) {
    console.error("❌ Raboros Engine Error:", error);

    // Parse error untuk user-friendly message
    const parsedError = parseError(error);
    throw new Error(
      `${parsedError.title}: ${parsedError.message}${
        parsedError.details ? `\n\n${parsedError.details}` : ""
      }`
    );
  }
};

/**
 * Raboros Financial Advisor - Analisis cerdas dan rekomendasi strategis
 */
export const askAdvisor = async (
  query: string,
  expenses: ExpenseItem[]
): Promise<string> => {
  const model = "gemini-3-pro-preview";

  // Agregasi data untuk konteks yang lebih kaya
  const totalExpense = expenses.reduce((sum, e) => sum + e.price, 0);

  const categoryBreakdown = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.price;
    return acc;
  }, {} as Record<string, number>);

  const topExpenses = expenses.sort((a, b) => b.price - a.price).slice(0, 5);

  const context = `
═══════════════════════════════════════════════════════════════════
DATA KEUANGAN USER (${expenses.length} Transaksi)
═══════════════════════════════════════════════════════════════════

TOTAL PENGELUARAN: Rp ${totalExpense.toLocaleString("id-ID")}

BREAKDOWN PER KATEGORI:
${Object.entries(categoryBreakdown)
  .map(
    ([cat, total]) =>
      `- ${cat}: Rp ${total.toLocaleString("id-ID")} (${(
        (total / totalExpense) *
        100
      ).toFixed(1)}%)`
  )
  .join("\n")}

TOP 5 PENGELUARAN TERBESAR:
${topExpenses
  .map(
    (e, i) =>
      `${i + 1}. ${e.item} - Rp ${e.price.toLocaleString("id-ID")} (${
        e.category
      })`
  )
  .join("\n")}

RIWAYAT TRANSAKSI LENGKAP:
${expenses
  .map(
    (e) =>
      `${new Date(e.date).toLocaleDateString("id-ID")}: ${e.item} @ ${
        e.source
      } - Rp ${e.price.toLocaleString("id-ID")} [${e.category}]`
  )
  .join("\n")}
`;

  const systemInstruction = `Kamu adalah Raboros - Elite Financial Intelligence Advisor dengan kemampuan analisis tingkat master.

IDENTITAS:
- Nama: Raboros (Robot Advisory for Robust Financial Solutions)
- Kepribadian: Cerdas, tajam, elegan, strategis namun approachable
- Bahasa: Indonesia modern & profesional dengan sentuhan personal

MISI:
Membimbing user mencapai kebebasan finansial melalui:
1. Analisis pola pengeluaran yang mendalam
2. Identifikasi money leaks & optimisasi budget
3. Rekomendasi aksi konkret & terukur
4. Motivasi berbasis data, bukan asumsi

ATURAN RESPONS:
✓ SELALU gunakan data aktual dari konteks
✓ BERIKAN insight spesifik (bukan generik seperti "kurangi pengeluaran")
✓ SERTAKAN angka & persentase untuk kredibilitas
✓ TAWARKAN solusi praktis dengan prioritas jelas
✓ GUNAKAN analogi atau perbandingan untuk clarity
✓ AKHIRI dengan 1 action item yang bisa dilakukan hari ini

LARANGAN:
✗ Jawaban template/copy-paste
✗ Judgmental atau menggurui
✗ Rekomendasi tanpa basis data
✗ Menyebut "pengguna" atau "user" (gunakan "Anda" atau "kamu")

CONTOH GAYA RESPONS:
"Saya melihat pengeluaran Gaya Hidup Anda mencapai 45% dari total budget - ini 2x lipat dari threshold ideal 25%. Khususnya transaksi kafe (Rp 450.000 di 12 kunjungan bulan ini) bisa dioptimalkan. Coba target: 8 kunjungan/bulan = hemat Rp 150.000. Uang ini bisa dialihkan ke Investasi & Tabungan yang masih 0%. Action: Mulai auto-debit Rp 150.000/bulan ke reksadana pasar uang hari ini."

${context}`;

  try {
    const response = await withRetry(
      async () => {
        return await ai.models.generateContent({
          model,
          contents: query,
          config: {
            systemInstruction,
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 0 },
            maxOutputTokens: 1024,
          },
        });
      },
      {
        maxRetries: 2,
        initialDelay: 1000,
        timeout: 30000,
      }
    );

    return (
      response.text ||
      "Sistem Raboros sedang melakukan rekalibrasi. Silakan ulangi pertanyaan Anda."
    );
  } catch (error) {
    console.error("❌ Raboros Advisor Error:", error);

    // Parse error untuk user-friendly message
    const parsedError = parseError(error);
    throw new Error(
      `${parsedError.title}: ${parsedError.message}${
        parsedError.details ? `\n\n${parsedError.details}` : ""
      }`
    );
  }
};

/**
 * Utility: Generate monthly financial report
 */
export const generateMonthlyReport = async (
  expenses: ExpenseItem[],
  month: string // Format: "2025-01"
): Promise<string> => {
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(month));

  const query = `Buatkan laporan keuangan komprehensif untuk periode ${month}. Sertakan:
  1. Executive summary (total & tren)
  2. Top 3 kategori terbesar dengan analisis
  3. Red flags atau anomali pengeluaran
  4. Rekomendasi optimisasi budget untuk bulan depan
  5. Financial health score (0-100)`;

  try {
    return await askAdvisor(query, monthlyExpenses);
  } catch (error) {
    console.error("❌ Monthly Report Generation Error:", error);
    const parsedError = parseError(error);
    throw new Error(
      `${parsedError.title}: ${parsedError.message}${
        parsedError.details ? `\n\n${parsedError.details}` : ""
      }`
    );
  }
};

/**
 * Utility: Budget comparison & forecasting
 */
export const compareBudget = async (
  expenses: ExpenseItem[],
  budgetLimits: Record<CategoryType, number>
): Promise<string> => {
  const actual = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.price;
    return acc;
  }, {} as Record<string, number>);

  const comparison = Object.entries(budgetLimits)
    .map(([cat, limit]) => {
      const spent = actual[cat] || 0;
      const status = spent > limit ? "⚠️ OVER" : "✓ OK";
      return `${cat}: Rp ${spent.toLocaleString(
        "id-ID"
      )} / Rp ${limit.toLocaleString("id-ID")} ${status}`;
    })
    .join("\n");

  const query = `Analisis perbandingan budget vs aktual berikut:\n\n${comparison}\n\nBerikan insight & action plan.`;

  try {
    return await askAdvisor(query, expenses);
  } catch (error) {
    console.error("❌ Budget Comparison Error:", error);
    const parsedError = parseError(error);
    throw new Error(
      `${parsedError.title}: ${parsedError.message}${
        parsedError.details ? `\n\n${parsedError.details}` : ""
      }`
    );
  }
};
