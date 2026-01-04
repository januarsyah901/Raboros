# 💰 RABOROS - Financial Intelligence Assistant

**Raboros** adalah aplikasi manajemen keuangan berbasis AI yang membantu Anda menganalisis pengeluaran, membuat keputusan finansial yang lebih baik, dan mencapai kebebasan finansial. Didukung oleh Google Gemini AI untuk analisis cerdas dan saran strategi keuangan yang personal.

## 📋 Daftar Isi

- [Tentang Raboros](#-tentang-raboros)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Quick Start](#-quick-start)
- [Konfigurasi](#-konfigurasi)
- [Cara Menggunakan](#-cara-menggunakan)
- [Struktur Proyek](#-struktur-proyek)
- [API Endpoints](#-api-endpoints)
- [Kategori Pengeluaran](#-kategori-pengeluaran)
- [Error Handling](#-error-handling--quota-management)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)

---

## 🎯 Tentang Raboros

Raboros adalah platform AI-powered untuk:
- **Tracking Pengeluaran Otomatis** - Scan struk atau input manual, AI ekstrak detail transaksi
- **Financial Analytics** - Dashboard interaktif dengan visualisasi breakdown per kategori
- **Smart Budgeting** - Alokasi budget per kategori dengan anomaly detection real-time
- **AI Financial Advisor** - Chat dengan AI untuk mendapat saran keuangan yang strategis dan personal

Aplikasi ini dirancang untuk mahasiswa, freelancer, dan individu yang ingin mengelola keuangan dengan lebih efisien dan data-driven.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
|**Scan Struk Belanja** | Upload foto struk, AI ekstrak detail item dan harga otomatis |
|**AI Financial Advisor** | Chat dengan AI untuk analisis pengeluaran dan tips hemat |
|**Dashboard Analytics** | Visualisasi real-time dengan donut chart breakdown per kategori |
|**Budget Allocation** | Tentukan alokasi budget per kategori dengan progress tracking |
|**Anomaly Detection** | Alert otomatis jika gaya hidup > kebutuhan pokok |
|**Smart Categorization** | 6 kategori dengan deteksi otomatis (sarapan, makan siang, makan malam = Pokok) |
|**Dark/Light Mode** | Interface modern dengan glass morphism dan responsive design |
|**Error Modal** | User-friendly error handling dengan solusi actionable |
|**Database Persistent** | Semua data tersimpan di MySQL untuk keamanan |
|**Optimized Performance** | Code splitting, fast load time, smooth animations |

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.3** - Modern UI library dengan hooks
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Lightning-fast build tool dengan optimasi
- **TailwindCSS 3.4+** - Utility-first CSS framework (via PostCSS)
- **Lucide Icons 0.562.0** - Beautiful, consistent icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js v5** - Web framework dengan modern features
- **MySQL 8.0** - Relational database
- **Google Gemini API v1.34.0** - Advanced AI model untuk analisis

### Build & DevOps
- **PostCSS 8.4.32** - CSS processing pipeline
- **Autoprefixer 10.4.18** - Automatic browser vendor prefixes
- **tsx 4.21.0** - TypeScript executor

---

## 📋 Prasyarat

Pastikan sudah terinstall di sistem Anda:

```bash
# Cek versi
node --version    # v18+ direkomendasikan
npm --version     # v9+
mysql --version   # v8.0+
```

**Requirement Lengkap:**
- ✅ Node.js v18 atau lebih baru
- ✅ npm v9+ atau yarn package manager
- ✅ MySQL 8.0 server (local atau remote)
- ✅ Google Gemini API Key (free tier tersedia di [ai.google.dev](https://ai.google.dev))

---

## 🚀 Quick Start

### 1️⃣ Setup Repository

```bash
# Clone repository
git clone <repository-url>
cd raboros

# Install dependencies
npm install
```

### 2️⃣ Setup Database

```bash
# Pastikan MySQL server running, lalu jalankan:
npm run setup-db
```

Script akan otomatis membuat:
- Database `raboros_db`
- Tabel `expenses` dengan schema lengkap
- Tabel `budget` untuk alokasi budget

### 3️⃣ Konfigurasi Environment

```bash
# Copy template ke .env
cp .env.example .env

# Edit dengan editor favorit
nano .env  # atau buka di VS Code
```

### 4️⃣ Jalankan Aplikasi

```bash
# Development mode (Frontend + Backend bersamaan)
npm run dev:all

# ATAU jalankan terpisah di 2 terminal:
# Terminal 1: Backend
npm run server      # http://localhost:3001

# Terminal 2: Frontend  
npm run dev         # http://localhost:3000
```

✅ Aplikasi siap di **http://localhost:3000**

---

## ⚙️ Konfigurasi

### File: `.env`

Copy dari `.env.example` dan sesuaikan dengan setup Anda:

```env
# Google Gemini API Key
# Dapatkan dari: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSyD...

# MySQL Database Configuration
DB_HOST=localhost          # localhost untuk local MySQL, atau IP remote
DB_USER=root              # default user MySQL
DB_PASSWORD=              # kosongkan jika tidak ada password
DB_NAME=raboros_db        # akan dibuat otomatis saat npm run setup-db

# Server Configuration
PORT=3001                 # jangan ganti kecuali ada konflik port
```

### Quick Setup via CLI

Jika ingin setup langsung via terminal tanpa edit file:

```bash
cat > .env << EOF
GEMINI_API_KEY=your_api_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=raboros_db
PORT=3001
EOF
```

### Mendapatkan Google Gemini API Key

1. Buka [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Klik **"Create API Key"**
3. Pilih atau buat project baru
4. Copy API key yang dihasilkan
5. Paste ke `GEMINI_API_KEY` di file `.env`

**Note:** Free tier Google Gemini menyediakan 20 permintaan per hari.

---

## 📖 Cara Menggunakan

### 1. Input Pengeluaran Manual

```
Input Text: "Beli roti 15000 di Indomaret"

AI akan otomatis:
✓ Extract item: "Roti"
✓ Detect harga: 15000
✓ Categorize: "Kebutuhan Pokok" (sarapan → pokok)
✓ Save ke database
```

**Tips:** Semakin deskriptif input, semakin akurat kategorisasi.

### 2. Scan Struk Belanja 📷

1. Klik **icon Gambar** (📸) di toolbar bawah
2. Upload foto struk belanja (atau Ctrl+V paste langsung)
3. Tunggu AI selesai analisis (5-10 detik)
4. Verifikasi hasil dan klik **Simpan**
5. Data otomatis tersimpan ke database

**Format supported:** JPG, PNG, WebP (resolusi baik)

### 3. Set Budget Allocation 💰

1. Klik **tombol Budget** (📄 icon FileText) di header
2. Tentukan alokasi per kategori:
   - Contoh: Pokok 2juta, Transport 1juta, Gaya Hidup 500ribu
3. Lihat progress bar dan persentase penggunaan
4. Klik **Simpan** untuk confirm

**Fitur:**
- Progress bar color: 🟢 Aman (biru) / 🔴 Over Budget (merah)
- Update real-time saat ada transaksi baru

### 4. Chat dengan AI Advisor 💬

1. Klik **icon Chat** (💬) di header
2. Tanyakan apapun tentang keuangan Anda

**Contoh Pertanyaan:**
```
"Berapa total pengeluaran saya minggu ini?"
"Kategori mana yang paling boros?"
"Berikan tips hemat untuk transportasi"
"Apakah saya overspending?"
```

AI akan memberikan insight dan rekomendasi actionable.

### 5. Monitor Dashboard 📊

**Total Keluaran**
- Sum total semua transaksi
- Counter jumlah OPS (Operations/Operasi)

**Alokasi Strategis**
- Progress bar per kategori
- Persentase penggunaan vs budget
- Visual indicator status

**Insight Dinamis**
- 🟢 **Kondisi Stabil** - Pengeluaran seimbang
- 🔴 **Anomali Terdeteksi** - Gaya hidup melebihi pokok (perlu perhatian)

**Riwayat Transaksi**
- Log lengkap semua transaksi
- Grouping per kategori
- Sort by date terbaru

### 6. Manajemen Data 🗑️

**Hapus Single Transaksi**
- Klik icon trash pada item
- Confirm via modal custom (bukan alert browser)

**Hapus Semua Data**
- Klik tombol **Reset** di header
- Confirm via warning modal
- Data akan dihapus permanen

---

## 📁 Struktur Proyek

```
raboros/
├── components/
│   ├── ExpenseDashboard.tsx      # 📊 Dashboard dengan budget & anomaly detection
│   ├── ExpenseList.tsx           # 📝 Daftar transaksi dengan grouping kategori
│   ├── BudgetAllocationModal.tsx # 💰 Modal alokasi budget per kategori
│   └── ConfirmModal.tsx          # ✅ Custom confirmation dialog
├── contexts/
│   └── ThemeContext.tsx          # 🎨 Theme management (dark/light mode)
├── server/
│   ├── index.ts                  # 🚀 Express server dengan API routes
│   ├── db.ts                     # 🗄️ MySQL connection pool
│   └── setup-db.ts               # 🔧 Database & table auto initialization
├── services/
│   └── geminiService.ts          # 🤖 Google Gemini API integration
├── App.tsx                        # 🎯 Main app dengan state & error handling
├── types.ts                       # 📘 TypeScript interfaces
├── constants.tsx                  # 📋 Kategori metadata & icon constants
├── index.css                      # 🎨 Tailwind + custom styles
├── index.tsx                      # ⚛️ React entry point
├── index.html                     # 📄 HTML template
├── .env.example                   # 📝 Environment template (copy ke .env)
├── package.json                   # 📦 Dependencies & npm scripts
├── tailwind.config.js             # 🎯 Tailwind CSS configuration
├── postcss.config.js              # 🔌 PostCSS plugin pipeline
├── vite.config.ts                 # ⚡ Vite bundler configuration
├── tsconfig.json                  # 📘 TypeScript configuration
└── README.md                       # 📚 Dokumentasi ini
```

---

## 🔌 API Endpoints

### Expenses Management

```
GET     /api/expenses              # Ambil semua expenses
POST    /api/expenses              # Create new expenses (array)
DELETE  /api/expenses/:id          # Delete by ID
DELETE  /api/expenses              # Delete all expenses
```

**Request Example:**
```bash
# POST /api/expenses
{
  "expenses": [
    {
      "item": "Roti",
      "price": 15000,
      "category": "Kebutuhan Pokok",
      "source": "manual"
    }
  ]
}
```

### Budget Management

```
GET     /api/budget                # Ambil budget allocation saat ini
POST    /api/budget                # Create/update budget allocation
```

**Request Example:**
```bash
# POST /api/budget
{
  "budget": {
    "Kebutuhan Pokok": 2000000,
    "Transportasi & Servis": 1000000,
    "Gaya Hidup": 500000
  }
}
```

---

## 🏷️ Kategori Pengeluaran

Sistem menggunakan **6 kategori utama** dengan smart detection:

| Kategori | Emoji | Termasuk | Contoh |
|----------|-------|----------|--------|
| **Kebutuhan Pokok** | 🛒 | Makanan, sembako, sarapan, makan siang, makan malam | Nasi goreng, beli beras, sarapan pagi |
| **Transportasi & Servis** | 🚗 | BBM, ojol, grab, parkir, servis, tol | Isi bensin, gojek, servis motor |
| **Gaya Hidup** | ☕ | Kafe, restoran, fashion, hiburan, hobby | Kopi Starbucks, shopping, bioskop |
| **Kesehatan** | 💊 | Obat, dokter, RS, vitamin, alat kesehatan | Obat flu, checkup dokter, vitamin |
| **Investasi & Tabungan** | 💰 | Nabung, investasi, asuransi, deposito, saham, emas | Setor tabungan, beli emas, reksadana |
| **Lainnya** | 📦 | Yang tidak masuk kategori di atas | Berbagai pengeluaran lainnya |

**Smart Detection Rules:**
- Keyword "sarapan", "makan siang", "makan malam" → **Kebutuhan Pokok**
- Keyword "kafe", "kopi", "restoran" → **Gaya Hidup**
- Keyword "investasi", "asuransi", "nabung" → **Investasi & Tabungan**
- Deteksi kategorisasi via AI Gemini dengan prompt rules spesifik

---

## 🆘 Error Handling & Quota Management

### Error Modal dengan Solusi Detail

Aplikasi menampilkan error dengan modal informatif (bukan browser alert):

```
Modal akan menampilkan:
- Icon warning/error dengan warna sesuai tipe
- Judul error yang deskriptif
- Pesan detail tentang masalah
- Solusi actionable steps
```

### Error Type Detection

#### 1️⃣ **Quota API Terlampaui** (429 Error)

```
⚠️ Quota API Terlampaui

Anda telah mencapai batas 20 permintaan/hari

Solusi:
1. Tunggu 24 jam untuk automatic reset
2. Upgrade ke paid plan: console.cloud.google.com
3. Gunakan API Key dari project GCP lain
```

**Free Tier Limits:**
- 20 requests per day (automatic reset 24 jam)
- Max 100 requests per minute
- No support, best effort

#### 2️⃣ **API Key Tidak Valid** (401 Error)

```
❌ API Key Tidak Valid

Konfigurasi API Key gagal

Solusi:
1. Cek GEMINI_API_KEY di .env
2. Generate API Key baru: ai.google.dev
3. Pastikan API sudah enabled di project
4. Restart aplikasi setelah perubahan
```

#### 3️⃣ **Server Error** (5xx Error)

```
🔴 Server Error

Kesalahan internal server

Solusi:
1. Cek console backend untuk error details
2. Restart backend server
3. Hubungi support jika error terus terjadi
```

### Retry Time Extraction

Saat API quota habis, error message akan menampilkan:
```
"Please retry in 15 seconds"

Modal akan parse dan tampilkan:
⏱️ Retry tersedia dalam: 15 detik
[Countdown timer...]
[Retry Button]
```

---

## 🆘 Troubleshooting

### ❌ Error: "Cannot find module mysql2"

```bash
npm install mysql2
```

### ❌ Error: "tsx: command not found"

```bash
npm install -D tsx
```

### ❌ Database Connection Failed

```bash
# Pastikan MySQL running
mysql --version

# Cek konfigurasi .env
cat .env | grep DB_

# Test koneksi manual
mysql -h localhost -u root -p
```

### ❌ Frontend tidak muncul

```bash
# Pastikan index.html ada script module
cat index.html | grep "type=\"module\""

# Clear browser cache
# Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
```

### ❌ Error: "Quota API Terlampaui"

Free tier Gemini: **20 permintaan/hari**

**Solusi:**
1. ✅ Tunggu 24 jam untuk automatic reset
2. ✅ Upgrade ke paid plan: [console.cloud.google.com](https://console.cloud.google.com)
3. ✅ Gunakan API Key dari project GCP lain
4. ✅ Coba di hari berikutnya

### ❌ Tailwind CSS tidak loading

```bash
# Pastikan CSS diimport di index.tsx
grep "import.*index.css" index.tsx

# Rebuild
npm run build
```

### ❌ Frontend tidak connect ke Backend

```bash
# Cek backend running
curl http://localhost:3001/api/expenses

# Check CORS di server/index.ts
# Pastikan port 3001 tidak conflict
lsof -i :3001
```

### ❌ Port 3000 atau 3001 sudah terpakai

```bash
# Cari process yang pakai port 3000
lsof -i :3000

# Kill process (ganti PID dengan nomor)
kill -9 PID

# Atau gunakan port berbeda di vite.config.ts
```

---

## 🔐 Security Best Practices

- ✅ `.env` sudah di `.gitignore` (tidak commit ke git)
- ✅ Gunakan environment variables untuk secrets
- ✅ API Key hanya di backend, jangan expose ke frontend
- ✅ Validasi input di server sebelum save ke database
- ✅ Gunakan HTTPS di production
- ✅ CORS hanya untuk origin yang trusted
- ✅ Hash password jika ada auth user

---

## 🚀 Deployment

### Deploy Frontend ke Vercel

```bash
npm install -g vercel
vercel
```

Follow prompts, vercel akan handle build otomatis.

### Deploy Backend ke Heroku

```bash
heroku create your-app-name
heroku addons:create cleardb:ignite
git push heroku main
heroku config:set GEMINI_API_KEY=your_key
```

### Environment di Production

Pastikan set semua env var di production hosting:
- `GEMINI_API_KEY`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `PORT`

---

## 📊 Performance Optimization

- ✅ Vite code splitting untuk faster load (vendor-react, vendor-gemini, components)
- ✅ React.useMemo prevent unnecessary re-renders
- ✅ TailwindCSS production build dengan PurgeCSS
- ✅ MySQL connection pooling untuk efficient queries
- ✅ Lazy loading components di React
- ✅ Image optimization untuk struk scan

---

## 📝 npm Scripts

```bash
npm run dev          # Start dev server (Frontend Vite)
npm run server       # Start Express server (Backend)
npm run dev:all      # Start both Frontend + Backend concurrently
npm run setup-db     # Initialize MySQL database & tables
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 📚 Dokumentasi Eksternal

- [Google Gemini API](https://ai.google.dev/docs)
- [React 19 Docs](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev)
- [MySQL](https://dev.mysql.com/doc/)

---

## 🤝 Kontribusi

Kontribusi sangat diterima! 

**Cara berkontribusi:**

1. Fork repository
2. Buat branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

---

## 📄 License

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

---

## 👨‍💻 Changelog

### v1.2.0 (Latest)
- ✨ Tailwind CSS CDN → Local PostCSS setup
- ✨ Vite build optimization dengan code splitting
- ✨ Error Modal dengan retry time extraction
- ✨ Smart error detection (Quota, Auth, Server)
- ✨ Actionable error solutions dengan links

### v1.1.0
- ✨ Icon replacements (Fingerprint→FileText, Camera→Image)
- ✨ Meal detection (sarapan, makan siang, makan malam)
- ✨ Custom ConfirmModal untuk delete operations
- ✨ Anomaly detection dan budget allocation

### v1.0.0
- ✨ Initial release dengan scan struk, AI advisor, dashboard
- ✨ MySQL database integration
- ✨ Dark/light theme support

---

## ❓ FAQ

**Q: Berapa biaya aplikasi ini?**
A: Gratis! Menggunakan free tier Google Gemini API (20 req/hari)

**Q: Apakah data saya aman?**
A: Ya, semua data disimpan di MySQL lokal Anda. Jangan share `.env` file!

**Q: Bisa deploy ke server sendiri?**
A: Tentu! Ikuti panduan Deployment di atas.

**Q: Gimana cara menambah kategori?**
A: Edit array di `constants.tsx`, lalu update Gemini prompt di `geminiService.ts`.

---

## 💬 Butuh Bantuan?

- 📧 Open issue di repository
- 💬 Discord/Telegram community
- 📖 Baca dokumentasi di atas
- 🔍 Search di GitHub issues

---

**Dikembangkan dengan ❤️ untuk membantu Anda mencapai financial freedom.**

Terima kasih telah menggunakan RABOROS! 🚀
