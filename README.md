# Rasa Nusantara

Aplikasi menu restoran dengan frontend Next.js, REST API Express, dan database MySQL.

---

## Prasyarat

- Windows PowerShell
- Node.js 20.9 atau lebih baru dan npm
- MySQL 8 (misalnya melalui Laragon)

Port default: MySQL `3306`, API `3000`, dan frontend `3001`.

## Menjalankan dari Awal

### 1. Jalankan MySQL

Buka Laragon dan pilih **Start All** atau jalankan layanan MySQL. Pastikan MySQL aktif pada port `3306` sebelum memulai API. Port database bukan port untuk perintah `npm run dev`.

### 2. Siapkan dan jalankan API

Buka terminal PowerShell pertama dari folder proyek:

```powershell
cd api
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Pastikan `api/.env` sesuai dengan koneksi MySQL lokal:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=db_restoran
DB_PORT=3306
```

Inisialisasi database/tabel, lalu jalankan API:

```powershell
npm run migrate
npm run dev
```

Biarkan terminal ini tetap berjalan. Untuk mode production gunakan `npm start` sebagai pengganti `npm run dev`.

### 3. Siapkan dan jalankan frontend

Buka terminal PowerShell kedua dari folder proyek:

```powershell
cd frontend
npm install
$env:NEXT_PUBLIC_API_URL = "http://localhost:3000"
npm run dev -- --port 3001
```

Buka [http://localhost:3001](http://localhost:3001). API health check: [http://localhost:3000/api/health](http://localhost:3000/api/health). Endpoint daftar menu: [http://localhost:3000/api/menu?limit=0](http://localhost:3000/api/menu?limit=0).

Frontend dan API harus berjalan di terminal terpisah. Jika halaman menampilkan API tidak tersambung, pastikan MySQL aktif, API berjalan di port `3000`, dan `NEXT_PUBLIC_API_URL` mengarah ke alamat API. Jika API mengembalikan `data: []`, koneksi berhasil tetapi database belum memiliki menu.

## Build dan Jalankan Production

Pastikan MySQL aktif. Di terminal pertama, jalankan API:

```powershell
cd api
npm install
npm run migrate
npm start
```

Di terminal kedua, atur URL API sebelum build frontend:

```powershell
cd frontend
npm install
$env:NEXT_PUBLIC_API_URL = "http://localhost:3000"
npm run build
npm run start -- --port 3001
```

Buka [http://localhost:3001](http://localhost:3001). API Express tidak memiliki langkah build terpisah; `npm start` menjalankan server Node.js. URL `NEXT_PUBLIC_API_URL` dimasukkan saat build frontend.

## Menu Contoh

Database baru belum berisi menu. Untuk mengisi menu contoh, jalankan dari folder `api`:

```powershell
npm run seed
```

**Perhatian:** skrip seed menjalankan `TRUNCATE TABLE menu` sebelum memasukkan data, sehingga menghapus semua menu yang sudah tersimpan. Jangan jalankan pada database berisi data penting tanpa backup.

## Pemeriksaan API

Dengan MySQL dan API aktif, jalankan dari PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
Invoke-RestMethod "http://localhost:3000/api/menu?limit=0"
```

Atau jalankan test API dari folder `api` dengan `npm test`.
