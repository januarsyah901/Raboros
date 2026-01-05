# RABOROS - Financial Intelligence Assistant

Aplikasi manajemen keuangan berbasis AI untuk tracking pengeluaran, analisis spending, dan financial advice otomatis.

## Fitur

- Scan struk belanja otomatis dengan AI
- Chat dengan AI advisor untuk financial tips
- Dashboard analytics dengan breakdown per kategori
- Budget allocation dan tracking real-time
- Anomaly detection untuk overspending
- 6 kategori pengeluaran dengan smart detection
- Dark/Light mode support

## Requirement

- Node.js v18+
- npm v9+
- MySQL 8.0+ (atau Docker)
- Google Gemini API Key ([dapatkan di sini](https://aistudio.google.com/app/apikey))

## Quick Install

### Opsi 1: Dengan Docker (Recommended)

Paling simple - cukup clone dan jalankan Docker:

```bash
git clone https://github.com/januarsyah901/Raboros.git
cd raboros
cp .env.docker .env.docker
# Edit .env.docker dan masukkan GEMINI_API_KEY Anda
docker-compose --env-file .env.docker up --build
```

Akses aplikasi di http://localhost:3000

**Prerequisites:** Docker dan Docker Compose

### Opsi 2: Local Development

Jalankan di local machine tanpa Docker:

```bash
git clone <repo-url>
cd raboros
npm install
cp .env.example .env
# Edit .env dengan API key Anda
npm run setup-db
npm run dev:all
```

## Instalasi Lengkap

### Cara 1: Docker (Recommended untuk Quick Start)

#### Prerequisites

- Docker dan Docker Compose installed
- Gemini API Key

#### Setup Steps

1. **Clone Repository**

```bash
git clone <repository-url>
cd raboros
```

2. **Persiapan Environment Variables**

```bash
cp .env.docker .env.docker
# Edit .env.docker dan masukkan GEMINI_API_KEY Anda
```

3. **Build dan Run**

```bash
# Run dengan build
docker-compose --env-file .env.docker up --build

# Atau run di background
docker-compose --env-file .env.docker up -d --build
```

4. **Akses Aplikasi**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MySQL: localhost:3306

#### Docker Environment Variables

Edit `.env.docker` untuk customize:

```env
# Database Configuration
DB_HOST=db
DB_PORT=3306
DB_USER=raboros_user
DB_PASSWORD=raboros_password
DB_NAME=raboros_db
DB_ROOT_PASSWORD=rootpassword

# API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Application
NODE_ENV=production
PORT=3001
```

#### Docker Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Remove everything (including data)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build

# Access MySQL
docker exec -it raboros-mysql mysql -u raboros_user -p raboros_db
```

#### Docker Troubleshooting

**Port already in use:**

```bash
APP_PORT=4000 docker-compose up
```

**Database not initializing:**

```bash
docker-compose logs db
```

---

### Cara 2: Local Development Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd raboros
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Setup Database

Pastikan MySQL server sudah running, lalu jalankan:

```bash
npm run setup-db
```

Script ini akan membuat database `raboros_db` dan tabel-tabel yang diperlukan.

#### 4. Konfigurasi Environment

Copy file template:

```bash
cp .env.example .env
```

Edit `.env` dengan text editor (nano, VS Code, dll):

```env
GEMINI_API_KEY=your_api_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=raboros_db
PORT=3001
```

Ganti `your_api_key_here` dengan Google Gemini API Key Anda.

#### 5. Jalankan Aplikasi

Opsi A - Jalankan bersamaan (recommended):

```bash
npm run dev:all
```

Opsi B - Jalankan terpisah:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

## Cara Menggunakan

### Input Manual

Ketik deskripsi pengeluaran di text input, contoh:

```
"Beli roti 15000 di Indomaret"
```

AI akan otomatis extract item, harga, kategori, dan simpan ke database.

### Scan Struk Belanja

1. Klik tombol "Gambar" di toolbar
2. Upload foto struk belanja (JPG, PNG, WebP)
3. AI akan ekstrak semua item
4. Verifikasi hasil dan klik "Simpan"

### Alokasi Budget

1. Klik tombol "Budget" di header
2. Tentukan alokasi budget per kategori
3. Monitor progress bar real-time
4. Klik "Simpan"

### Chat dengan AI

1. Klik tombol "Chat" di header
2. Tanya apa saja tentang keuangan Anda
3. Contoh: "Berapa total pengeluaran saya?", "Kategori mana yang paling boros?"

### Monitor Dashboard

- Lihat total pengeluaran dengan counter transaksi
- Breakdown per kategori dengan chart
- Progress bar alokasi budget
- Alert jika ada anomali spending
- Log lengkap semua transaksi

## Kategori Pengeluaran

1. **Kebutuhan Pokok** - Makanan, sembako, sarapan, makan siang/malam
2. **Transportasi & Servis** - BBM, ojol, parkir, service
3. **Gaya Hidup** - Kafe, restoran, hiburan, fashion
4. **Kesehatan** - Obat, dokter, vitamin
5. **Investasi & Tabungan** - Nabung, asuransi, investasi, saham
6. **Lainnya** - Kategori lain

## Tech Stack

| Komponen | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React 19, TypeScript, Vite, TailwindCSS |
| Backend  | Node.js, Express.js v5                  |
| Database | MySQL 8.0                               |
| AI       | Google Gemini API                       |
| Icons    | Lucide React                            |

## API Endpoints

```
GET     /api/expenses              # Get semua expenses
POST    /api/expenses              # Create expenses baru
DELETE  /api/expenses/:id          # Delete by ID
DELETE  /api/expenses              # Delete semua

GET     /api/budget                # Get budget saat ini
POST    /api/budget                # Update budget
```

## Struktur Project

```
raboros/
├── components/          # React components
├── contexts/           # Theme context
├── server/             # Backend API
├── services/           # Gemini integration
├── App.tsx             # Main app
├── types.ts            # TypeScript types
├── constants.tsx       # Category constants
├── index.css           # Global styles
└── package.json        # Dependencies
```

## Troubleshooting

### MySQL Connection Error

```bash
# Check MySQL running
mysql --version

# Test connection
mysql -h localhost -u root -p
```

### Module Not Found

```bash
npm install mysql2
npm install -D tsx
```

### Port Already in Use

```bash
# Check port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

### API Quota Habis

Free tier Gemini: 20 requests per hari

- Tunggu 24 jam untuk reset otomatis
- Atau upgrade ke paid plan

### CSS Not Loading

```bash
# Check import
grep "import.*index.css" index.tsx

# Rebuild
npm run build
```

### Frontend Cannot Connect to Backend

```bash
# Check backend running
curl http://localhost:3001/api/expenses

# Check port 3001 not in use
lsof -i :3001
```

## npm Scripts

```bash
npm run dev          # Frontend dev server
npm run server       # Backend server
npm run dev:all      # Frontend + Backend
npm run setup-db     # Initialize database
npm run build        # Production build
npm run preview      # Preview build
```

## Security

- .env sudah di .gitignore
- API Key hanya disimpan di backend
- Semua data disimpan lokal di MySQL
- Input divalidasi di server

## Deployment

### Deploy Frontend ke Vercel

```bash
npm install -g vercel
vercel
```

### Deploy Backend ke Heroku

```bash
heroku create app-name
heroku addons:create cleardb:ignite
git push heroku main
heroku config:set GEMINI_API_KEY=your_key
```

## License

MIT License
