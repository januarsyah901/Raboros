# RABOROS - Financial Intelligence

Aplikasi manajemen keuangan pintar berbasis AI yang menggunakan Google Gemini untuk menganalisis struk belanja dan memberikan insight keuangan.

## Fitur Utama

- **Scan Struk Belanja** - Upload foto struk untuk otomatis ekstrak data pengeluaran
- **AI Financial Advisor** - Chat dengan AI untuk mendapatkan saran keuangan
- **Dashboard Analytics** - Visualisasi pengeluaran berdasarkan kategori dengan breakdown real-time
- **Budget Allocation** - Alokasi budget strategis per kategori dengan monitoring progress
- **Anomaly Detection** - Deteksi otomatis ketika pengeluaran gaya hidup melampaui kebutuhan pokok
- **Database MySQL** - Penyimpanan data permanen di database
- **UI Modern** - Interface modern dengan glass morphism effect dan dark mode
- **Kategori Smart** - 6 kategori pengeluaran: Kebutuhan Pokok, Transportasi, Gaya Hidup, Kesehatan, Tabungan, Lainnya

## Teknologi & Dependensi

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Lucide Icons
- **Backend**: Express.js v5, Node.js
- **Database**: MySQL 8.0
- **AI**: Google Gemini API (@google/genai v1.34.0)
- **Utilities**: CORS, dotenv, tsx

## Prasyarat

Pastikan sudah terinstall:

- Node.js v18 atau lebih baru
- npm atau yarn
- MySQL 8.0 atau lebih baru
- API Key Google Gemini ([Dapatkan di sini](https://ai.google.dev/))

## Cara Install

### 1. Clone atau Download Repository

```bash
git clone <repository-url>
cd raboros
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database MySQL

Pastikan MySQL server sudah running, lalu jalankan:

```bash
# Setup database dan tabel otomatis
npm run setup-db
```

Script ini akan membuat:

- Database `raboros_db`
- Tabel `expenses` dengan kolom: id, item, price, category, source, date

### 4. Konfigurasi Environment Variables

Buat file `.env` di root folder dengan isi:

```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=raboros_db

# Server Configuration
PORT=3001
```

**Ganti:**

- `your_gemini_api_key_here` dengan API key Gemini Anda
- `your_mysql_password` dengan password MySQL Anda (kosongkan jika tidak ada password)

### 5. Jalankan Aplikasi

**Opsi 1: Jalankan Backend dan Frontend Terpisah**

Terminal 1 - Backend API:

```bash
npm run server
```

Terminal 2 - Frontend:

```bash
npm run dev
```

**Opsi 2: Jalankan Bersamaan (Recommended)**

```bash
npm run dev:all
```

Aplikasi akan berjalan di:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Cara Menggunakan

### 1. Input Pengeluaran Manual

1. Ketik deskripsi pengeluaran di input text
2. Contoh: "Beli roti 15000 di Indomaret"
3. Klik tombol **Send** atau tekan Enter
4. AI akan menganalisis dan menyimpan ke database

### 2. Scan Struk Belanja

1. Klik icon **Camera**
2. Upload foto struk belanja
3. AI akan membaca dan ekstrak semua item belanja
4. Data otomatis tersimpan ke database dengan kategori yang tepat

### 3. Atur Budget Allocation

1. Klik tombol **Edit** di bagian "Alokasi Strategis"
2. Tentukan alokasi budget untuk setiap kategori
3. Sistem akan menampilkan progress bar untuk tracking pengeluaran
4. Warna indikator: 🟢 Aman / 🔴 Over Budget

### 4. Chat dengan AI Advisor

1. Klik icon **Chat** di header
2. Tanyakan apapun tentang keuangan Anda
3. Contoh pertanyaan:
   - "Berapa total pengeluaran saya bulan ini?"
   - "Kategori mana yang paling boros?"
   - "Berikan tips hemat untuk transportasi"

### 5. Monitor Dashboard

- **Total Keluaran** - Menampilkan total pengeluaran dengan counter jumlah transaksi (OPS)
- **Alokasi Strategis** - Progress per kategori dengan persentase penggunaan budget
- **Insight Dinamis** - Notifikasi anomali atau kondisi stabil
- **Kondisi Stabil** - Struktur pengeluaran seimbang antara kebutuhan pokok dan gaya hidup
- **Anomali Terdeteksi** - Alert ketika gaya hidup pengeluaran > kebutuhan pokok

## Struktur Folder

```
raboros/
├── components/             # React components
│   ├── ExpenseDashboard.tsx   # Dashboard dengan budget tracking
│   ├── ExpenseList.tsx        # Daftar transaksi
│   ├── BudgetAllocationModal.tsx # Modal alokasi budget
│   └── ThemeContext.tsx       # Theme dark/light
├── contexts/               # React Context
│   └── ThemeContext.tsx      # Theme management
├── server/                # Backend API
│   ├── index.ts           # Express server
│   ├── db.ts              # MySQL connection
│   └── setup-db.ts        # Database setup script
├── services/              # Frontend services
│   └── geminiService.ts   # Google Gemini API integration
├── App.tsx               # Main app component
├── types.ts              # TypeScript types & interfaces
├── constants.tsx         # Kategori & constants
├── .env                  # Environment variables (git ignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Keamanan

- File `.env` sudah ditambahkan ke `.gitignore`
- Jangan commit API key ke repository
- Gunakan environment variables untuk data sensitif

## Troubleshooting

### Error: "mysql.createPool is not a function"

```bash
npm install mysql2
```

### Error: "tsx: command not found"

```bash
npm install -D tsx
```

### Error: Database connection failed

- Pastikan MySQL server running
- Cek username/password di file `.env`
- Cek port MySQL (default: 3306)

### Frontend tidak muncul di browser

- Pastikan file `index.html` memiliki script: `<script type="module" src="/index.tsx"></script>`
- Clear cache browser (Ctrl+Shift+R)

## API Endpoints

| Method | Endpoint            | Deskripsi                       |
| ------ | ------------------- | ------------------------------- |
| GET    | `/api/expenses`     | Ambil semua pengeluaran         |
| POST   | `/api/expenses`     | Simpan pengeluaran baru         |
| DELETE | `/api/expenses/:id` | Hapus pengeluaran by ID         |
| DELETE | `/api/expenses`     | Hapus semua pengeluaran         |
| GET    | `/api/budget`       | Ambil alokasi budget saat ini   |
| POST   | `/api/budget`       | Simpan/update budget allocation |

## Kategori Pengeluaran

1. **Kebutuhan Pokok** - Makanan, kebutuhan harian essensial
2. **Transportasi & Servis** - Bensin, ojol, servis kendaraan
3. **Gaya Hidup** - Entertainment, fashion, dining out
4. **Kesehatan** - Obat, dokter, gym
5. **Tabungan** - Investasi, dana darurat
6. **Lainnya** - Kategori lain yang tidak masuk kategori di atas

## Kontribusi

Feel free to submit issues atau pull requests!

## License

MIT License

---
