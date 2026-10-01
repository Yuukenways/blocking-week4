const db = require("../config/database");

/**
 * GET /api/menu
 * Mengambil daftar menu dengan dukungan:
 * - Search keyword (q / search)
 * - Filter kategori
 * - Filter status (tersedia/habis)
 * - Filter rentang harga (min_price, max_price)
 * - Sorting (sortBy: nama, harga, created_at, id; order: ASC / DESC)
 * - Pagination (page, limit) atau limit=0 / all=true untuk semua data
 */
const getAllMenu = async (req, res) => {
    try {
        const {
            q,
            search,
            kategori,
            status,
            min_price,
            max_price,
            sortBy = "id",
            order = "DESC",
            page = 1,
            limit = 12,
            all
        } = req.query;

        const conditions = [];
        const params = [];

        // 1. Pencarian keyword di nama atau deskripsi
        const searchTerm = (q || search || "").trim();
        if (searchTerm) {
            conditions.push("(nama LIKE ? OR deskripsi LIKE ?)");
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        // 2. Filter Kategori
        if (kategori && kategori !== "Semua") {
            conditions.push("kategori = ?");
            params.push(kategori.trim());
        }

        // 3. Filter Status
        if (status && status !== "semua") {
            conditions.push("status = ?");
            params.push(status.trim());
        }

        // 4. Filter Rentang Harga
        if (min_price !== undefined && min_price !== "") {
            const min = parseFloat(min_price);
            if (!isNaN(min)) {
                conditions.push("harga >= ?");
                params.push(min);
            }
        }

        if (max_price !== undefined && max_price !== "") {
            const max = parseFloat(max_price);
            if (!isNaN(max)) {
                conditions.push("harga <= ?");
                params.push(max);
            }
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // 5. Validasi Sorting
        const allowedSortFields = ["id", "nama", "harga", "kategori", "status", "created_at"];
        const validSortBy = allowedSortFields.includes(sortBy.toLowerCase()) ? sortBy.toLowerCase() : "id";
        const validOrder = (order || "").toUpperCase() === "ASC" ? "ASC" : "DESC";

        // Hitung total items yang cocok
        const countSql = `SELECT COUNT(*) AS total FROM menu ${whereClause}`;
        const [countResult] = await db.query(countSql, params);
        const totalItems = countResult[0].total;

        // 6. Pagination Logic
        const isAll = all === "true" || parseInt(limit) === 0;
        let currentPage = Math.max(1, parseInt(page) || 1);
        let perPage = isAll ? totalItems : Math.max(1, parseInt(limit) || 12);
        const totalPages = isAll || totalItems === 0 ? 1 : Math.ceil(totalItems / perPage);

        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }

        const offset = (currentPage - 1) * perPage;

        let querySql = `
            SELECT id, nama, kategori, harga, deskripsi, status, gambar, created_at, updated_at
            FROM menu
            ${whereClause}
            ORDER BY ${validSortBy} ${validOrder}
        `;

        const queryParams = [...params];
        if (!isAll) {
            querySql += ` LIMIT ? OFFSET ?`;
            queryParams.push(perPage, offset);
        }

        const [rows] = await db.query(querySql, queryParams);

        // Format harga ke number untuk kemudahan frontend
        const formattedRows = rows.map(item => ({
            ...item,
            harga: parseFloat(item.harga)
        }));

        res.json({
            success: true,
            message: "Berhasil mengambil data menu",
            data: formattedRows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: isAll ? 1 : currentPage,
                limit: isAll ? totalItems : perPage,
                hasNextPage: isAll ? false : currentPage < totalPages,
                hasPrevPage: isAll ? false : currentPage > 1
            }
        });

    } catch (error) {
        console.error("Error pada getAllMenu:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data menu dari database",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

/**
 * GET /api/menu/categories
 * Mengambil daftar kategori unik beserta jumlah itemnya
 */
const getCategories = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT kategori, COUNT(*) AS count
            FROM menu
            GROUP BY kategori
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            message: "Berhasil mengambil kategori menu",
            data: rows
        });
    } catch (error) {
        console.error("Error pada getCategories:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar kategori"
        });
    }
};

/**
 * GET /api/menu/stats
 * Mengambil ringkasan statistik menu (total menu, harga terendah, tertinggi, rata-rata, dll)
 */
const getMenuStats = async (req, res) => {
    try {
        const [summary] = await db.query(`
            SELECT 
                COUNT(*) AS totalMenu,
                SUM(CASE WHEN status = 'tersedia' THEN 1 ELSE 0 END) AS totalTersedia,
                SUM(CASE WHEN status = 'habis' THEN 1 ELSE 0 END) AS totalHabis,
                MIN(harga) AS hargaTerendah,
                MAX(harga) AS hargaTertinggi,
                AVG(harga) AS hargaRataRata,
                COUNT(DISTINCT kategori) AS totalKategori
            FROM menu
        `);

        res.json({
            success: true,
            message: "Berhasil mengambil statistik menu",
            data: {
                totalMenu: summary[0].totalMenu,
                totalTersedia: summary[0].totalTersedia,
                totalHabis: summary[0].totalHabis,
                hargaTerendah: parseFloat(summary[0].hargaTerendah || 0),
                hargaTertinggi: parseFloat(summary[0].hargaTertinggi || 0),
                hargaRataRata: Math.round(parseFloat(summary[0].hargaRataRata || 0)),
                totalKategori: summary[0].totalKategori
            }
        });
    } catch (error) {
        console.error("Error pada getMenuStats:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil statistik menu"
        });
    }
};

/**
 * GET /api/menu/:id
 * Mengambil detail satu menu berdasarkan ID
 */
const getMenuById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "ID menu tidak valid"
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM menu WHERE id = ?",
            [parseInt(id)]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Menu dengan ID ${id} tidak ditemukan`
            });
        }

        const item = {
            ...rows[0],
            harga: parseFloat(rows[0].harga)
        };

        res.json({
            success: true,
            data: item
        });

    } catch (error) {
        console.error("Error pada getMenuById:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data menu"
        });
    }
};

/**
 * POST /api/menu
 * Menambahkan menu baru dengan validasi ketat
 */
const createMenu = async (req, res) => {
    try {
        const {
            nama,
            kategori,
            harga,
            deskripsi,
            status = "tersedia",
            gambar
        } = req.body;

        // Validasi input
        const errors = [];
        if (!nama || typeof nama !== "string" || nama.trim().length < 2) {
            errors.push("Nama menu harus berupa teks minimal 2 karakter");
        }
        if (!kategori || typeof kategori !== "string" || kategori.trim().length === 0) {
            errors.push("Kategori wajib diisi");
        }
        const parsedHarga = parseFloat(harga);
        if (isNaN(parsedHarga) || parsedHarga <= 0) {
            errors.push("Harga harus berupa angka valid lebih besar dari 0");
        }

        const validStatus = status === "habis" ? "habis" : "tersedia";

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validasi gagal",
                errors
            });
        }

        const defaultGambar = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";

        const [result] = await db.query(
            `INSERT INTO menu (nama, kategori, harga, deskripsi, status, gambar)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nama.trim(),
                kategori.trim(),
                parsedHarga,
                (deskripsi || "").trim(),
                validStatus,
                (gambar && gambar.trim()) ? gambar.trim() : defaultGambar
            ]
        );

        const newId = result.insertId;
        const [newItem] = await db.query("SELECT * FROM menu WHERE id = ?", [newId]);

        res.status(201).json({
            success: true,
            message: "Menu berhasil ditambahkan",
            data: {
                ...newItem[0],
                harga: parseFloat(newItem[0].harga)
            }
        });

    } catch (error) {
        console.error("Error pada createMenu:", error);
        res.status(500).json({
            success: false,
            message: "Gagal menambahkan menu baru"
        });
    }
};

/**
 * PUT /api/menu/:id
 * Memperbarui menu yang ada
 */
const updateMenu = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "ID menu tidak valid"
            });
        }

        // Pastikan menu ada
        const [existing] = await db.query("SELECT * FROM menu WHERE id = ?", [parseInt(id)]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Menu dengan ID ${id} tidak ditemukan`
            });
        }

        const {
            nama,
            kategori,
            harga,
            deskripsi,
            status,
            gambar
        } = req.body;

        const current = existing[0];
        const newNama = nama !== undefined ? String(nama).trim() : current.nama;
        const newKategori = kategori !== undefined ? String(kategori).trim() : current.kategori;
        const newHarga = harga !== undefined ? parseFloat(harga) : parseFloat(current.harga);
        const newDeskripsi = deskripsi !== undefined ? String(deskripsi).trim() : current.deskripsi;
        const newStatus = status !== undefined ? (status === "habis" ? "habis" : "tersedia") : current.status;
        const newGambar = gambar !== undefined ? String(gambar).trim() : current.gambar;

        if (isNaN(newHarga) || newHarga <= 0) {
            return res.status(400).json({
                success: false,
                message: "Harga harus berupa angka valid lebih besar dari 0"
            });
        }

        await db.query(
            `UPDATE menu
             SET nama = ?,
                 kategori = ?,
                 harga = ?,
                 deskripsi = ?,
                 status = ?,
                 gambar = ?
             WHERE id = ?`,
            [newNama, newKategori, newHarga, newDeskripsi, newStatus, newGambar, parseInt(id)]
        );

        const [updated] = await db.query("SELECT * FROM menu WHERE id = ?", [parseInt(id)]);

        res.json({
            success: true,
            message: "Menu berhasil diperbarui",
            data: {
                ...updated[0],
                harga: parseFloat(updated[0].harga)
            }
        });

    } catch (error) {
        console.error("Error pada updateMenu:", error);
        res.status(500).json({
            success: false,
            message: "Gagal memperbarui menu"
        });
    }
};

/**
 * DELETE /api/menu/:id
 * Menghapus menu berdasarkan ID
 */
const deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "ID menu tidak valid"
            });
        }

        const [existing] = await db.query("SELECT * FROM menu WHERE id = ?", [parseInt(id)]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Menu dengan ID ${id} tidak ditemukan`
            });
        }

        await db.query("DELETE FROM menu WHERE id = ?", [parseInt(id)]);

        res.json({
            success: true,
            message: `Menu '${existing[0].nama}' berhasil dihapus`
        });

    } catch (error) {
        console.error("Error pada deleteMenu:", error);
        res.status(500).json({
            success: false,
            message: "Gagal menghapus menu"
        });
    }
};

module.exports = {
    getAllMenu,
    getCategories,
    getMenuStats,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu
};