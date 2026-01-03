# RABOROS - Financial Intelligence

Aplikasi manajemen keuangan pintar berbasis AI yang menggunakan Google Gemini untuk menganalisis struk belanja dan memberikan insight keuangan.

## Fitur Utama

- **Scan Struk Belanja** - Upload foto struk untuk otomatis ekstrak data pengeluaran
- **AI Financial Advisor** - Chat dengan AI untuk mendapatkan saran keuangan
- **Dashboard Analytics** - Visualisasi pengeluaran berdasarkan kategori
- **Database MySQL** - Penyimpanan data permanen di database
- **UI Modern** - Interface gelap yang elegan dengan glass morphism effect

## Teknologi

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: MySQL 8.0
- **AI**: Google Gemini API (@google/genai)

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

### 3. Chat dengan AI Advisor

1. Klik icon **Chat** di header
2. Tanyakan apapun tentang keuangan Anda
3. Contoh pertanyaan:
   - "Berapa total pengeluaran saya bulan ini?"
   - "Kategori mana yang paling boros?"
   - "Berikan tips hemat untuk transportasi"

### 4. Lihat Dashboard

- **Total Pengeluaran** ditampilkan di card utama
- **Breakdown Kategori** menunjukkan distribusi pengeluaran
- **Riwayat Transaksi** dengan detail per item

## Struktur Folder

```
raboros/
├── components/          # React components
│   ├── ExpenseDashboard.tsx
│   └── ExpenseList.tsx
├── server/             # Backend API
│   ├── index.ts        # Express server
│   ├── db.ts          # MySQL connection
│   └── setup-db.ts    # Database setup script
├── services/          # Frontend services
│   └── geminiService.ts
├── App.tsx            # Main app component
├── types.ts           # TypeScript types
├── .env              # Environment variables (git ignored)
├── package.json
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

| Method | Endpoint            | Deskripsi               |
| ------ | ------------------- | ----------------------- |
| GET    | `/api/expenses`     | Ambil semua pengeluaran |
| POST   | `/api/expenses`     | Simpan pengeluaran baru |
| DELETE | `/api/expenses/:id` | Hapus pengeluaran by ID |
| DELETE | `/api/expenses`     | Hapus semua pengeluaran |

## Kontribusi

Feel free to submit issues atau pull requests!

## License

MIT License

---
