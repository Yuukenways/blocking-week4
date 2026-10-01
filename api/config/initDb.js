const mysql = require("mysql2/promise");
require("dotenv").config();

async function initDatabase() {
    try {
        console.log("Memeriksa dan menginisialisasi database...");

        const dbHost = process.env.DB_HOST || "localhost";
        const dbUser = process.env.DB_USER || "root";
        const dbPassword = process.env.DB_PASSWORD || "";
        const dbPort = process.env.DB_PORT || 3306;
        const dbName = process.env.DB_NAME || "db_restoran";

        // 1. Koneksi awal tanpa database untuk memastikan DATABASE sudah dibuat
        const rootConn = await mysql.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPassword,
            port: dbPort
        });

        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await rootConn.end();
        console.log(`-> Database '${dbName}' siap digunakan.`);

        // 2. Gunakan connection pool aplikasi untuk membuat tabel & kolom
        const db = require("./database");

        await db.query(`
            CREATE TABLE IF NOT EXISTS menu (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                kategori VARCHAR(50) NOT NULL,
                harga DECIMAL(12,2) NOT NULL,
                deskripsi TEXT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'tersedia',
                gambar VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Periksa apakah kolom 'deskripsi' dan 'status' sudah ada
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'menu'
        `, [dbName]);

        const colNames = columns.map(c => c.COLUMN_NAME.toLowerCase());

        if (!colNames.includes("deskripsi")) {
            await db.query(`ALTER TABLE menu ADD COLUMN deskripsi TEXT NULL AFTER harga`);
            console.log("-> Kolom 'deskripsi' berhasil ditambahkan ke tabel menu.");
        }

        if (!colNames.includes("status")) {
            await db.query(`ALTER TABLE menu ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'tersedia' AFTER deskripsi`);
            console.log("-> Kolom 'status' berhasil ditambahkan ke tabel menu.");
        }

        console.log("Database dan tabel menu berhasil diinisialisasi.");
    } catch (error) {
        console.error("Gagal menginisialisasi database:", error.message);
        throw error;
    }
}

if (require.main === module) {
    initDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = initDatabase;
