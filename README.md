# 🍲 Resto Rasa Nusantara - Portal Menu & API

Aplikasi Web Manajemen Menu Restoran modern berbasis **Express.js**, **MySQL**, dan **Vanilla JS Frontend** yang dilengkapi dengan **100+ data menu kuliner nusantara & internasional**, fitur pencarian instan, filter kategori, pengurutan, pagination, dan CRUD lengkap.

---

## 🚀 Fitur Utama
- **RESTful API Lengkap**: CRUD Menu, Endpoint Kategori, Statistik Ringkasan Menu.
- **100+ Menu Pilihan**: Makanan Utama, Seafood, Mie & Pasta, Steak & Western, Cemilan, Dessert, Minuman.
- **Frontend Interaktif & Estetik**: Modern Glassmorphism UI, Responsive, Real-time Debounced Search, Filter Kategori, Status Ketersediaan, Pagination, Modal Form CRUD, dan Modal Detail.
- **Auto Database Initialization**: Skrip inisialisasi otomatis membuat database dan tabel jika belum ada.

---

## 🛠️ Prasyarat
- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
- MySQL Server (misal via XAMPP, Laragon, Docker, atau MySQL Server standalone)

---

## ⚙️ Panduan Instalasi & Menjalankan

### 1. Masuk ke Direktori `api` dan Install Dependencies
```bash
cd api
npm install
```

### 2. Konfigurasi Database (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi koneksi MySQL Anda di dalam file `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_restoran
DB_PORT=3306
```

---

## 📦 Menjalankan Database (`initDb.js` & `seed.js`)

Ada 2 cara praktis untuk menjalankannya dari folder `api`:

### Cara 1: Menggunakan Perintah `npm run` (Direkomendasikan)
1. **Inisialisasi Database & Tabel:**
   ```bash
   npm run migrate
   ```
   *(Perintah ini akan membuat database `db_restoran` dan tabel `menu` secara otomatis jika belum ada).*

2. **Isi 100+ Data Menu Makanan & Minuman:**
   ```bash
   npm run seed
   ```
   *(Perintah ini akan mengisi 115 menu hidangan lengkap dengan harga, foto, kategori, dan deskripsi).*

---

### Cara 2: Menjalankan Langsung dengan `node`
```bash
# Inisialisasi struktur database & tabel:
node config/initDb.js

# Isi data 100+ menu kuliner:
node seed.js
```

---

## 🏃 Menjalankan Aplikasi

Jalankan server Express:
```bash
npm run dev
# atau untuk production:
npm start
```

Setelah server aktif, buka browser Anda di:
- **Frontend Aplikasi**: [http://localhost:3000](http://localhost:3000)
- **API Endpoint Menu**: [http://localhost:3000/api/menu](http://localhost:3000/api/menu)
- **API Endpoint Kategori**: [http://localhost:3000/api/menu/categories](http://localhost:3000/api/menu/categories)
- **API Endpoint Statistik**: [http://localhost:3000/api/menu/stats](http://localhost:3000/api/menu/stats)

---

## 🧪 Menguji API (Unit Test)
Untuk memastikan seluruh endpoint API berfungsi normal:
```bash
npm test
```
