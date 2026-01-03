
import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseItem, CategoryType, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const EXPENSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      item: { type: Type.STRING, description: "Nama barang atau layanan" },
      price: { type: Type.NUMBER, description: "Harga satuan atau total per baris dalam Rupiah (angka saja)" },
      category: { 
        type: Type.STRING, 
        description: "Kategori pengeluaran: 'Kebutuhan Pokok', 'Transportasi & Servis', 'Gaya Hidup', 'Kesehatan', atau 'Lainnya'" 
      },
      source: { type: Type.STRING, description: "Nama toko, bengkel, atau lokasi transaksi" }
    },
    required: ["item", "price", "category", "source"]
  }
};

export const processInput = async (
  input: string | { data: string; mimeType: string }
): Promise<ExpenseItem[]> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Analisis struk atau teks pembelian berikut sebagai Raboros Intelligence. Ekstrak setiap item, harga, kategori, dan sumbernya.
  Gunakan kategori: 'Kebutuhan Pokok', 'Transportasi & Servis', 'Gaya Hidup', 'Kesehatan', atau 'Lainnya'.
  Pastikan konversi harga ke angka integer Rupiah dengan akurat.
  Kembalikan dalam format JSON murni.`;

  const contents = typeof input === 'string' 
    ? prompt + "\n\nInput Pengguna: " + input
    : { parts: [{ text: prompt }, { inlineData: input }] };

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: { responseMimeType: "application/json", responseSchema: EXPENSE_SCHEMA }
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((res: any) => ({
      ...res,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Raboros Engine Error:", error);
    throw error;
  }
};

export const askAdvisor = async (query: string, expenses: ExpenseItem[]): Promise<string> => {
  const model = "gemini-3-pro-preview"; // Use Pro for better advisory
  const context = expenses.map(e => `${e.date}: ${e.item} (${e.category}) - Rp${e.price}`).join('\n');
  
  const systemInstruction = `Kamu adalah Raboros, asisten keuangan elit dengan kecerdasan tingkat tinggi. 
  Misi kamu adalah membantu user mencapai kebebasan finansial melalui data pengeluaran mereka:
  ${context}
  
  Berikan analisis yang tajam, strategis, namun tetap elegan dan memotivasi. 
  Gunakan bahasa Indonesia yang modern, cerdas, dan profesional. Jangan memberikan jawaban generik.
  Fokus pada pola pengeluaran yang bisa dioptimalkan.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: { 
        systemInstruction,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Maaf, sistem analisis Raboros sedang dalam sinkronisasi.";
  } catch (error) {
    return "Terjadi anomali pada sistem Raboros. Mohon ulangi permintaan Anda.";
  }
};
