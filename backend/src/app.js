const cors = require("cors");
const express = require("express");

const adminDashboardRoutes = require("./routes/adminDashboard.routes");
const adminReportsRoutes = require("./routes/adminReports.routes");
const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");
const consoleRoutes = require("./routes/console.routes");
const packageRoutes = require("./routes/package.routes");
const productRoutes = require("./routes/product.routes");
const rateRoutes = require("./routes/rate.routes");
const reportRoutes = require("./routes/report.routes");
const transactionRoutes = require("./routes/transaction.routes");

const app = express();

function resolveErrorStatus(error) {
  if (error.status) {
    return error.status;
  }

  const message = (error.message || "").toLowerCase();

  if (
    message.includes("wajib diisi") ||
    message.includes("harus") ||
    message.includes("gunakan")
  ) {
    return 400;
  }

  if (message.includes("tidak ditemukan")) {
    return 404;
  }

  if (
    message.includes("tidak tersedia") ||
    message.includes("tidak aktif") ||
    message.includes("stok") ||
    message.includes("tidak cocok") ||
    message.includes("beda tipe") ||
    message.includes("sudah selesai")
  ) {
    return 409;
  }

  return 500;
}

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Rental PS API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/consoles", consoleRoutes);
app.use("/api/products", productRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/rates", rateRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/transactions", transactionRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  const statusCode = resolveErrorStatus(error);

  res.status(statusCode).json({
    success: false,
    message: error.message || "Terjadi kesalahan pada server.",
  });
});

module.exports = app;
