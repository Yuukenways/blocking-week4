const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const menuRoutes = require("./routes/menuRoutes");
const initDatabase = require("./config/initDb");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// API Health Check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

// Menu Routes
app.use("/api/menu", menuRoutes);

// Fallback for API 404 or SPA Frontend
app.use((req, res) => {
    if (req.originalUrl.startsWith("/api/")) {
        return res.status(404).json({
            success: false,
            message: "Endpoint API tidak ditemukan"
        });
    }
    res.sendFile(path.join(frontendPath, "index.html"), (err) => {
        if (err) {
            res.status(404).json({
                success: false,
                message: "Halaman tidak ditemukan"
            });
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({
        success: false,
        message: "Terjadi kesalahan internal pada server",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// Server Listen
const PORT = process.env.PORT || 3000;

// Initialize Database schema and start listening
initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server Restoran berjalan di: http://localhost:${PORT}`);
            console.log(`📖 Endpoint Menu API: http://localhost:${PORT}/api/menu`);
        });
    })
    .catch((err) => {
        console.error("Gagal inisialisasi database sebelum server jalan:", err);
        app.listen(PORT, () => {
            console.log(`⚠️ Server berjalan dengan peringatan DB di: http://localhost:${PORT}`);
        });
    });

module.exports = app;