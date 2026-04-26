import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  PackagePlus,
  ShoppingBasket,
  UserPlus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import SectionSkeleton from "../../components/SectionSkeleton.jsx";
import { getAdminDashboard } from "../../lib/api.js";
import { formatCompactRupiah, formatRupiah } from "../../lib/format.js";

function formatCompactNumber(value) {
  const amount = Number(value || 0);
  const formatValue = (input) => input.toFixed(1).replace(".0", "").replace(".", ",");

  if (amount >= 1000000) {
    return `${formatValue(amount / 1000000)}jt`;
  }

  if (amount >= 1000) {
    return `${formatValue(amount / 1000)}k`;
  }

  return `${amount}`;
}

function SummaryCard({ title, value, helper, tone = "default" }) {
  const helperClass = tone === "danger" ? "text-[var(--admin-danger)]" : "text-[var(--admin-success)]";
  const valueClass = tone === "danger" ? "text-[var(--admin-danger)]" : "text-[var(--admin-text)]";

  return (
    <article className="admin-kpi-card">
      <p className="admin-kpi-card__label">{title}</p>
      <p className={`admin-kpi-card__value ${valueClass}`}>{value}</p>
      <p className={`admin-kpi-card__helper ${helperClass}`}>{helper}</p>
    </article>
  );
}

function QuickActionCard({ icon: Icon, title, description, toneClassName, onClick }) {
  return (
    <button type="button" onClick={onClick} className="admin-quick-card">
      <div className={`admin-quick-card__icon ${toneClassName}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="admin-quick-card__copy">
        <p className="admin-quick-card__title">{title}</p>
        <p className="admin-quick-card__description">{description}</p>
      </div>
    </button>
  );
}

function RevenueChart({ items }) {
  if (!items.length) {
    return (
      <div className="admin-section-card">
        <div className="admin-section-card__header">
          <div>
            <p className="admin-section-card__eyebrow">Pendapatan 7 Hari Terakhir</p>
            <h3 className="admin-section-card__title">Tren Pendapatan</h3>
          </div>
          <button type="button" className="admin-section-link">
            Laporan lengkap <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <EmptyState
          title="Belum ada data pendapatan"
          description="Grafik akan muncul setelah ada transaksi completed."
          className="border-[var(--admin-border)] bg-[var(--admin-card-soft)]"
          titleClassName="text-[var(--admin-text)]"
          descriptionClassName="text-[var(--admin-text-muted)]"
        />
      </div>
    );
  }

  const maxRevenue = Math.max(...items.map((item) => Number(item.revenue || 0)), 1);
  const latestDate = items[items.length - 1]?.date;

  return (
    <div className="admin-section-card">
      <div className="admin-section-card__header">
        <div>
          <p className="admin-section-card__eyebrow">Pendapatan 7 Hari Terakhir</p>
          <h3 className="admin-section-card__title">Tren Pendapatan</h3>
        </div>
        <button type="button" className="admin-section-link">
          Laporan lengkap <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="admin-chart">
        {items.map((item) => {
          const revenue = Number(item.revenue || 0);
          const heightPercent = Math.max((revenue / maxRevenue) * 100, revenue > 0 ? 16 : 9);
          const isHighlighted = item.date === latestDate || revenue === maxRevenue;

          return (
            <div key={item.date} className="admin-chart__item">
              <p className="admin-chart__value">{formatCompactNumber(revenue)}</p>
              <div className="admin-chart__bar-shell">
                <div
                  className={`admin-chart__bar ${isHighlighted ? "admin-chart__bar--active" : ""}`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <p className="admin-chart__label">{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopProductsCard({ items, onViewAll }) {
  if (!items.length) {
    return (
      <div className="admin-section-card admin-section-card--tight">
        <div className="admin-section-card__header">
          <div>
            <p className="admin-section-card__eyebrow">Top Produk Terjual</p>
            <h3 className="admin-section-card__title">Produk Paling Laku</h3>
          </div>
        </div>
        <EmptyState
          title="Belum ada produk terjual"
          description="Top produk akan muncul setelah transaksi completed memiliki item."
          className="border-[var(--admin-border)] bg-[var(--admin-card-soft)]"
          titleClassName="text-[var(--admin-text)]"
          descriptionClassName="text-[var(--admin-text-muted)]"
        />
      </div>
    );
  }

  const maxQuantity = Math.max(...items.map((item) => Number(item.quantitySold || 0)), 1);

  return (
    <div className="admin-section-card admin-section-card--tight">
      <div className="admin-section-card__header">
        <div>
          <p className="admin-section-card__eyebrow">Top Produk Terjual</p>
          <h3 className="admin-section-card__title">Produk Paling Laku</h3>
        </div>
        <button type="button" onClick={onViewAll} className="admin-section-link">
          Lihat semua <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="admin-top-products">
        {items.map((item) => (
          <div key={item.id} className="admin-top-products__item">
            <div className="admin-top-products__meta">
              <p className="admin-top-products__name">{item.name}</p>
              <p className="admin-top-products__count">{formatCompactNumber(item.quantitySold)}</p>
            </div>
            <div className="admin-top-products__track">
              <div
                className="admin-top-products__fill"
                style={{ width: `${Math.max((Number(item.quantitySold || 0) / maxQuantity) * 100, 12)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentTransactionsCard({ items, onViewAll }) {
  const statusClasses = {
    ACTIVE: "admin-status-badge admin-status-badge--active",
    COMPLETED: "admin-status-badge admin-status-badge--completed",
  };

  return (
    <div className="admin-section-card">
      <div className="admin-section-card__header">
        <div>
          <p className="admin-section-card__eyebrow">Transaksi Terkini</p>
          <h3 className="admin-section-card__title">Aktivitas Terbaru</h3>
        </div>
        <button type="button" onClick={onViewAll} className="admin-section-link">
          Lihat semua <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Belum ada transaksi"
          description="Daftar transaksi terkini akan muncul setelah ada aktivitas."
          className="border-[var(--admin-border)] bg-[var(--admin-card-soft)]"
          titleClassName="text-[var(--admin-text)]"
          descriptionClassName="text-[var(--admin-text-muted)]"
        />
      ) : (
        <div className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Console</th>
                <th>Tipe</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="font-display-number text-[var(--admin-text)]">{item.shortCode}</td>
                  <td>{item.consoleCode}</td>
                  <td>{item.pricingType === "PACKAGE" ? "Paket" : "Open"}</td>
                  <td className="font-display-number">{formatCompactRupiah(item.grandTotal)}</td>
                  <td>
                    <span className={statusClasses[item.status] || "admin-status-badge"}>
                      {item.status === "COMPLETED" ? "SELESAI" : "AKTIF"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CriticalProductsCard({ items, onManage }) {
  return (
    <div className="admin-section-card admin-section-card--tight">
      <div className="admin-section-card__header">
        <div>
          <p className="admin-section-card__eyebrow">Stok Kritis</p>
          <h3 className="admin-section-card__title">Perlu Restock</h3>
        </div>
        <button type="button" onClick={onManage} className="admin-section-link">
          Kelola <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Tidak ada stok kritis"
          description="Semua produk aktif masih dalam kondisi aman."
          className="border-[var(--admin-border)] bg-[var(--admin-card-soft)]"
          titleClassName="text-[var(--admin-text)]"
          descriptionClassName="text-[var(--admin-text-muted)]"
        />
      ) : (
        <div className="admin-critical-list">
          {items.map((item) => (
            <div key={item.id} className="admin-critical-list__item">
              <div className="admin-critical-list__meta">
                <p className="admin-critical-list__name">{item.name}</p>
                <div className="admin-critical-list__track">
                  <div
                    className="admin-critical-list__fill"
                    style={{ width: `${Math.max((Math.min(Number(item.stock || 0), 5) / 5) * 100, 12)}%` }}
                  />
                </div>
              </div>
              <p className="admin-critical-list__count">{item.stock} sisa</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    refetchInterval: 30000,
  });

  const data = dashboardQuery.data || {
    summary: {
      todayRevenue: 0,
      monthlyTransactionCount: 0,
      monthlyRevenue: 0,
      criticalStockCount: 0,
      availableConsoleCount: 0,
      inUseConsoleCount: 0,
      maintenanceConsoleCount: 0,
      activeRevenueEstimate: 0,
    },
    revenueLast7Days: [],
    topProducts: [],
    recentTransactions: [],
    criticalProducts: [],
  };

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-6">
        <SectionSkeleton variant="grid" count={4} />
        <SectionSkeleton variant="list" count={3} />
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <ErrorState
        title="Dashboard admin gagal dimuat"
        description="Data kontrol admin belum bisa diambil sekarang. Coba muat ulang dashboard ini."
        onRetry={() => dashboardQuery.refetch()}
        className="border-[var(--admin-border)] bg-[#3b1b1d]"
      />
    );
  }

  return (
    <div className="admin-dashboard">
      <section className="admin-dashboard__hero">
        <div>
          <p className="admin-dashboard__eyebrow">Warm Control Panel</p>
          <h1 className="admin-dashboard__title">Ringkasan performa bisnis rental hari ini</h1>
          <p className="admin-dashboard__description">
            Pantau revenue aktif, transaksi, pergerakan produk, dan stok kritis dari satu panel admin.
          </p>
        </div>
        <div className="admin-dashboard__hero-stats">
          <div className="admin-dashboard__hero-pill">
            <CircleDollarSign className="h-4 w-4" />
            <span>Revenue aktif {formatCompactRupiah(data.summary.activeRevenueEstimate)}</span>
          </div>
          <div className="admin-dashboard__hero-pill">
            <ClipboardList className="h-4 w-4" />
            <span>{data.recentTransactions.length} transaksi terbaru dimuat</span>
          </div>
        </div>
      </section>

      <section className="admin-dashboard__kpi-grid">
        <SummaryCard
          title="Pendapatan hari ini"
          value={formatRupiah(data.summary.todayRevenue)}
          helper="Berdasarkan transaksi selesai hari ini"
        />
        <SummaryCard
          title="Transaksi bulan ini"
          value={String(data.summary.monthlyTransactionCount)}
          helper="Total transaksi selesai bulan berjalan"
        />
        <SummaryCard
          title="Pendapatan bulan ini"
          value={formatCompactRupiah(data.summary.monthlyRevenue)}
          helper="Akumulasi pendapatan bulan berjalan"
        />
        <SummaryCard
          title="Stok produk kritis"
          value={String(data.summary.criticalStockCount)}
          helper={
            data.summary.criticalStockCount > 0
              ? "Perlu restock segera"
              : "Stok produk aman"
          }
          tone={data.summary.criticalStockCount > 0 ? "danger" : "default"}
        />
      </section>

      <section className="admin-dashboard__quick-grid">
        <QuickActionCard
          icon={PackagePlus}
          title="Tambah produk"
          description="Stok dan harga baru"
          toneClassName="admin-quick-card__icon--purple"
          onClick={() => navigate("/admin/products")}
        />
        <QuickActionCard
          icon={ShoppingBasket}
          title="Tambah paket"
          description="Paket rental baru"
          toneClassName="admin-quick-card__icon--blue"
          onClick={() => navigate("/admin/packages")}
        />
        <QuickActionCard
          icon={BarChart3}
          title="Update harga"
          description="Rate per jam"
          toneClassName="admin-quick-card__icon--green"
          onClick={() => navigate("/admin/rates")}
        />
        <QuickActionCard
          icon={UserPlus}
          title="Buat akun kasir"
          description="User baru"
          toneClassName="admin-quick-card__icon--yellow"
          onClick={() => navigate("/admin/users")}
        />
      </section>

      <section className="admin-dashboard__content-grid">
        <div className="admin-dashboard__column">
          <RevenueChart items={data.revenueLast7Days} />
          <RecentTransactionsCard
            items={data.recentTransactions}
            onViewAll={() => navigate("/admin/reports")}
          />
        </div>

        <div className="admin-dashboard__column">
          <TopProductsCard
            items={data.topProducts}
            onViewAll={() => navigate("/admin/reports")}
          />
          <CriticalProductsCard
            items={data.criticalProducts}
            onManage={() => navigate("/admin/products")}
          />
        </div>
      </section>

      {!data.revenueLast7Days.length &&
      !data.topProducts.length &&
      !data.recentTransactions.length &&
      !data.criticalProducts.length ? (
        <EmptyState
          title="Dashboard admin masih kosong"
          description="Belum ada data transaksi atau produk yang cukup untuk ditampilkan."
          className="border-[var(--admin-border)] bg-[var(--admin-card-soft)]"
          titleClassName="text-[var(--admin-text)]"
          descriptionClassName="text-[var(--admin-text-muted)]"
        />
      ) : null}
    </div>
  );
}

export default AdminDashboardPage;
