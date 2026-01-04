# RABOROS - Financial Intelligence

Aplikasi manajemen keuangan pintar berbasis AI yang menggunakan Google Gemini untuk menganalisis struk belanja dan memberikan insight keuangan.

## Fitur Utama

- **Scan Struk Belanja** - Upload foto struk untuk otomatis ekstrak data pengeluaran dengan icon gambar
- **AI Financial Advisor** - Chat dengan AI untuk mendapatkan saran keuangan strategis
- **Dashboard Analytics** - Visualisasi pengeluaran berdasarkan kategori dengan breakdown real-time dan donut chart
- **Budget Allocation** - Alokasi budget strategis per kategori dengan monitoring progress dan visual indicators
- **Anomaly Detection** - Deteksi otomatis ketika pengeluaran gaya hidup melampaui kebutuhan pokok
- **Custom Confirmation Modal** - Dialog konfirmasi untuk operasi sensitif seperti menghapus data
- **Database MySQL** - Penyimpanan data permanen di database
- **UI Modern** - Interface modern dengan glass morphism effect, dark/light mode, dan responsive design
- **Kategori Smart** - 6 kategori pengeluaran dengan deteksi otomatis sarapan, makan siang, dan makan malam
- **Riwayat Transaksi** - Log lengkap semua pengeluaran dengan grouping per kategori

## Teknologi & Dependensi

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS (via PostCSS), Lucide Icons
- **Styling**: TailwindCSS 3.4+ dengan PostCSS dan Autoprefixer
- **Backend**: Express.js v5, Node.js
- **Database**: MySQL 8.0
- **AI**: Google Gemini API (@google/genai v1.34.0)
- **Utilities**: CORS, dotenv, tsx
- **Build Tool**: Vite 6 dengan optimasi code splitting

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

1. Klik icon **Gambar** di toolbar bawah
2. Upload foto struk belanja (atau paste langsung via Ctrl+V)
3. AI akan membaca dan ekstrak semua item belanja
4. Data otomatis tersimpan ke database dengan kategori yang tepat

### 3. Atur Budget Allocation

1. Klik tombol **Budget** di header dengan icon catatan (FileText)
2. Tentukan alokasi budget untuk setiap kategori
3. Sistem akan menampilkan progress bar untuk tracking pengeluaran
4. Warna indikator: 🟢 Aman (biru) / 🔴 Over Budget (merah)
5. Tekan tombol **Simpan** untuk menyimpan alokasi

### 4. Chat dengan AI Advisor

1. Klik icon **Chat** di header
2. Tanyakan apapun tentang keuangan Anda
3. Contoh pertanyaan:
   - "Berapa total pengeluaran saya bulan ini?"
   - "Kategori mana yang paling boros?"
   - "Berikan tips hemat untuk transportasi"

### 5. Monitor Dashboard & Riwayat Transaksi

- **Total Keluaran** - Menampilkan total pengeluaran dengan counter jumlah transaksi (OPS = Operations/Operasi)
- **Alokasi Strategis** - Progress per kategori dengan persentase penggunaan budget dan visual indicator
- **Insight Dinamis** - Notifikasi anomali atau kondisi stabil berdasarkan analisis real-time
- **Kondisi Stabil** - Struktur pengeluaran seimbang antara kebutuhan pokok dan gaya hidup
- **Anomali Terdeteksi** - Alert otomatis ketika gaya hidup pengeluaran > kebutuhan pokok
- **Riwayat Transaksi** - Log lengkap dengan grouping per kategori, sortir by date terbaru

### 6. Menghapus Data

- **Hapus Single Transaksi** - Klik tombol trash pada item, akan muncul confirmation modal
- **Hapus Semua Data** - Klik tombol **Reset** di header, akan muncul modal konfirmasi dengan warning
- Semua dialog konfirmasi menggunakan custom modal (bukan browser alert)

## Struktur Folder

```
raboros/
├── components/                    # React components
│   ├── ExpenseDashboard.tsx       # Dashboard dengan budget tracking & anomaly detection
│   ├── ExpenseList.tsx            # Daftar transaksi dengan grouping kategori
│   ├── BudgetAllocationModal.tsx  # Modal alokasi budget strategis
│   └── ConfirmModal.tsx           # Modal konfirmasi custom untuk delete operations
├── contexts/                      # React Context
│   └── ThemeContext.tsx           # Theme management (dark/light)
├── server/                        # Backend API
│   ├── index.ts                   # Express server dengan routes API
│   ├── db.ts                      # MySQL connection pool
│   └── setup-db.ts                # Database & tabel auto setup
├── services/                      # Frontend services
│   └── geminiService.ts           # Google Gemini API integration untuk AI analysis
├── App.tsx                        # Main app component dengan state management & error handling
├── types.ts                       # TypeScript types & interfaces
├── constants.tsx                  # Kategori metadata & icon constants
├── index.css                      # Global styles dengan Tailwind directives
├── index.tsx                      # React entry point
├── index.html                     # HTML entry point
├── .env                           # Environment variables (git ignored)
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies & npm scripts
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite bundler config dengan optimization
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
└── README.md                       # Dokumentasi ini
```

## Keamanan

- File `.env` sudah ditambahkan ke `.gitignore`
- Jangan commit API key ke repository
- Gunakan environment variables untuk data sensitif

## Error Handling & Quota Management

### Error Modal dengan Solusi Detail

- Menampilkan error dengan modal yang informatif (bukan browser alert)
- Deteksi otomatis error type: Quota Exhausted, Auth Error, Server Error
- Untuk Quota Limit: Tampilkan retry time dan link upgrade API
- Untuk Auth Error: Saran cara generate API Key baru di Google AI Studio

### Handling Gemini API Quota

- Free Tier: 20 permintaan per hari
- Error message akan menampilkan sisa waktu tunggu sebelum quota reset
- Solusi: Upgrade ke API berbayar atau tunggu 24 jam untuk reset
- Link: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

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

### Error: Tailwind CSS warning tentang content pattern

Jika melihat warning tentang `./**/*.js` matching node_modules:

- Sudah fixed di `tailwind.config.js` dengan pattern yang spesifik
- Pattern hanya scan: `./*.{js,ts,jsx,tsx}`, `./components/**`, `./contexts/**`, `./services/**`

### Error: "Quota API Terlampaui" / 429 Error

Anda telah mencapai batas free tier Google Gemini (20 permintaan/hari):

- Solusi 1: Tunggu 24 jam untuk automatic reset
- Solusi 2: Upgrade ke paid plan di https://console.cloud.google.com
- Solusi 3: Gunakan API Key dari project GCP yang berbeda

### Melihat Build Warning tentang chunk size

Build optimization sudah diatur di `vite.config.ts`:

- Chunk size warning limit: 1MB (dari default 500KB)
- Manual chunks: vendor-react, vendor-gemini, components
- Hasil: Faster load time dan better caching

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

1. **Kebutuhan Pokok** - Makanan, bahan makanan dasar, sarapan, makan siang, makan malam, kebutuhan harian essensial
2. **Transportasi & Servis** - Bensin, ojol, grab, service kendaraan, parkir, tol
3. **Gaya Hidup** - Kafe, restoran, hiburan, fashion, hobi, lifestyle
4. **Kesehatan** - Obat, dokter, rumah sakit, vitamin, alat kesehatan
5. **Investasi & Tabungan** - Nabung, investasi, deposito, reksadana, saham, emas
6. **Lainnya** - Kategori lain yang tidak masuk kategori di atas

## Update Terbaru (v1.2.0)

### Styling & Build Optimization

- ✨ Tailwind CSS dipindahkan dari CDN ke local setup via PostCSS
- ✨ Buat `tailwind.config.js`, `postcss.config.js`, `index.css` untuk production-ready styling
- ✨ Vite build optimization dengan manual chunk splitting (vendor-react, vendor-gemini, components)
- ✨ Chunk size warning limit ditingkatkan menjadi 1MB dengan optimal caching strategy

### Error Handling Enhancement

- ✨ Error Modal dengan design yang user-friendly (bukan browser alert)
- ✨ Smart error detection: Quota Exhausted, Auth Error, Server Error
- ✨ Extract retry time dari error message (e.g., "Please retry in 15 seconds")
- ✨ Solusi detail untuk setiap error type dengan actionable steps
- ✨ Link helper untuk fix API Key atau upgrade subscription

### Previous Updates (v1.1.0)

- Icon budget diganti dari Fingerprint ke FileText (catatan)
- Icon scan diganti dari Camera ke Image (gambar)
- Deteksi otomatis sarapan, makan siang, makan malam sebagai Kebutuhan Pokok
- Custom Confirmation Modal untuk semua delete operations (tidak pakai browser alert)
- Header "Log Aktivitas" diganti menjadi "Riwayat Transaksi" dengan icon Receipt
- Responsive design di header (hide text di mobile, show di sm+)

## Kontribusi

Feel free to submit issues atau pull requests!

## License

MIT License

---
