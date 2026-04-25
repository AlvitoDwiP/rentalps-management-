import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ClipboardList,
  PackagePlus,
  ShoppingBasket,
  UserPlus,
  Wallet,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import SectionSkeleton from "../../components/SectionSkeleton.jsx";
import { getAdminDashboard } from "../../lib/api.js";
import { formatRupiah } from "../../lib/format.js";

function formatCompactCurrency(value) {
  const amount = Number(value || 0);
  const formatValue = (input) => input.toFixed(1).replace(".0", "").replace(".", ",");

  if (amount >= 1000000) {
    return `Rp${formatValue(amount / 1000000)} jt`;
  }

  if (amount >= 1000) {
    return `Rp${formatValue(amount / 1000)}k`;
  }

  return `Rp${amount}`;
}

function formatChartRevenue(value) {
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

function SummaryCard({ title, value, accent = "purple", helper, icon: Icon }) {
  const accentClass =
    accent === "danger"
      ? "text-rose-300"
      : "text-violet-300";
  const borderClass =
    accent === "danger"
      ? "border-rose-500/20"
      : "border-violet-500/20";
  const glowClass =
    accent === "danger"
      ? "shadow-[0_22px_50px_-34px_rgba(225,29,72,0.48)]"
      : "shadow-[0_22px_50px_-34px_rgba(139,92,246,0.55)]";

  return (
    <article
      className={`rounded-[1.9rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.82))] p-5 ${borderClass} ${glowClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className={`font-display-number mt-5 text-[2.9rem] font-semibold leading-none ${accentClass}`}>
            {value}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">{helper}</p>
        </div>
        {Icon ? (
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-violet-200">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function MiniStat({ label, value, tone = "violet" }) {
  const toneClass = {
    emerald: "bg-emerald-500/14 text-emerald-200 border-emerald-500/20",
    blue: "bg-sky-500/14 text-sky-200 border-sky-500/20",
    amber: "bg-amber-500/14 text-amber-200 border-amber-500/20",
  }[tone];

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.16em] opacity-75">{label}</p>
      <p className="font-display-number mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group cursor-pointer rounded-[1.65rem] border border-violet-500/16 bg-[linear-gradient(180deg,rgba(124,58,237,0.14),rgba(15,23,42,0.82))] p-5 text-left transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-[linear-gradient(180deg,rgba(139,92,246,0.22),rgba(15,23,42,0.88))] hover:shadow-[0_18px_46px_-30px_rgba(139,92,246,0.8)]"
      title={title}
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/16 text-violet-200 transition group-hover:bg-violet-500/22">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-200">
        Buka Halaman
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </button>
  );
}

function RevenueChart({ items }) {
  const maxRevenue = Math.max(...items.map((item) => Number(item.revenue || 0)), 1);

  return (
    <div className="rounded-[1.85rem] border border-violet-500/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.88))] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
            Chart Pendapatan
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">7 Hari Terakhir</h3>
        </div>
        <BarChart3 className="h-6 w-6 text-violet-300" />
      </div>

      <div className="mt-8 grid grid-cols-7 items-end gap-3">
        {items.map((item) => {
          const revenue = Number(item.revenue || 0);
          const heightPercent = Math.max((revenue / maxRevenue) * 100, revenue > 0 ? 12 : 6);

          return (
            <div key={item.date} className="flex min-h-[220px] flex-col justify-end">
              <p className="mb-3 text-[11px] font-medium text-slate-400">
                {formatChartRevenue(revenue)}
              </p>
              <div className="flex h-[172px] items-end">
                <div className="w-full rounded-t-[1rem] bg-violet-500/10 ring-1 ring-inset ring-violet-400/10">
                  <div
                    className="w-full rounded-t-[1rem] bg-[linear-gradient(180deg,#d8b4fe_0%,#8b5cf6_42%,#6d28d9_100%)] shadow-[0_18px_42px_-26px_rgba(139,92,246,0.7)]"
                    style={{ height: `${heightPercent}%`, minHeight: revenue > 0 ? "18px" : "10px" }}
                  />
                </div>
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-slate-300">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopProductsCard({ items }) {
  if (!items.length) {
    return (
      <div className="rounded-[1.75rem] border border-violet-500/16 bg-white/[0.04] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
          Top Produk
        </p>
        <div className="mt-5">
          <EmptyState
            title="Belum ada produk terjual"
            description="Top produk akan muncul setelah transaksi completed memiliki item."
            className="border-white/10 bg-slate-950/40"
            titleClassName="text-white"
            descriptionClassName="text-slate-400"
          />
        </div>
      </div>
    );
  }

  const maxQuantity = Math.max(...items.map((item) => Number(item.quantitySold || 0)), 1);

  return (
    <div className="rounded-[1.75rem] border border-violet-500/16 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
            Top Produk
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Produk Terlaris</h3>
        </div>
        <ShoppingBasket className="h-6 w-6 text-violet-300" />
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/8 bg-slate-950/34 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {formatCompactNumber(item.quantitySold)} terjual
                </p>
              </div>
              <p className="font-display-number text-sm text-violet-200">
                {formatCompactCurrency(item.revenue)}
              </p>
            </div>
            <div className="mt-4 h-2.5 rounded-full bg-white/8">
              <div
                className="h-2.5 rounded-full bg-[linear-gradient(90deg,#7c3aed_0%,#c084fc_100%)]"
                style={{ width: `${Math.max((item.quantitySold / maxQuantity) * 100, 10)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentTransactionsCard({ items }) {
  const statusClasses = {
    ACTIVE: "bg-sky-500/14 text-sky-200 border-sky-500/20",
    COMPLETED: "bg-emerald-500/14 text-emerald-200 border-emerald-500/20",
  };

  return (
    <div className="rounded-[1.75rem] border border-violet-500/16 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
            Transaksi Terkini
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Aktivitas Terbaru</h3>
        </div>
        <ClipboardList className="h-6 w-6 text-violet-300" />
      </div>

      {items.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Belum ada transaksi"
            description="Daftar transaksi terkini akan muncul setelah ada aktivitas."
            className="border-white/10 bg-slate-950/40"
            titleClassName="text-white"
            descriptionClassName="text-slate-400"
          />
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-white/8 bg-slate-950/30">
          <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/8 bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Console</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-white/6 text-slate-200 last:border-b-0">
                  <td className="px-4 py-4 font-display-number text-violet-200">{item.shortCode}</td>
                  <td className="px-4 py-4">{item.consoleCode}</td>
                  <td className="px-4 py-4">{item.pricingType}</td>
                  <td className="px-4 py-4">{formatRupiah(item.grandTotal)}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusClasses[item.status] || "bg-slate-500/14 text-slate-200 border-white/10"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CriticalProductsCard({ items }) {
  return (
    <div className="rounded-[1.75rem] border border-rose-500/16 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-300">
            Stok Kritis
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Perlu Restock</h3>
        </div>
        <AlertTriangle className="h-6 w-6 text-rose-300" />
      </div>

      {items.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-emerald-500/16 bg-emerald-500/8 px-4 py-4 text-sm text-emerald-200">
          Aman. Tidak ada produk aktif dengan stok kritis saat ini.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/14 bg-rose-500/8 px-4 py-4"
            >
              <p className="font-medium text-white">{item.name}</p>
              <span className="font-display-number text-lg font-semibold text-rose-300">
                {item.stock}
              </span>
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
      <div className="space-y-5">
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
        className="border-white/10 bg-rose-500/10"
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[1.95rem] border border-violet-500/18 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.28),transparent_28%),linear-gradient(180deg,rgba(30,27,75,0.82),rgba(15,23,42,0.96))] p-6 xl:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
              Admin Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white xl:text-[3.35rem]">
              Rental PS Control Panel
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Pantau pendapatan, transaksi, performa produk, kesehatan stok, dan status
              console dari satu dashboard admin.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-full border border-violet-400/16 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
                Revenue Aktif {formatRupiah(data.summary.activeRevenueEstimate)}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
                {data.recentTransactions.length} transaksi terbaru dimuat
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat
              label="Available"
              value={data.summary.availableConsoleCount}
              tone="emerald"
            />
            <MiniStat label="In Use" value={data.summary.inUseConsoleCount} tone="blue" />
            <MiniStat
              label="Maintenance"
              value={data.summary.maintenanceConsoleCount}
              tone="amber"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          title="Pendapatan Hari Ini"
          value={formatRupiah(data.summary.todayRevenue)}
          helper="Akumulasi transaksi selesai hari ini"
          icon={Wallet}
        />
        <SummaryCard
          title="Transaksi Bulan Ini"
          value={String(data.summary.monthlyTransactionCount)}
          helper="Jumlah transaksi completed bulan berjalan"
          icon={ClipboardList}
        />
        <SummaryCard
          title="Pendapatan Bulan Ini"
          value={formatRupiah(data.summary.monthlyRevenue)}
          helper="Akumulasi grand total bulan berjalan"
          icon={BarChart3}
        />
        <SummaryCard
          title="Stok Produk Kritis"
          value={String(data.summary.criticalStockCount)}
          helper="Produk aktif dengan stok 5 atau kurang"
          accent={data.summary.criticalStockCount > 0 ? "danger" : "purple"}
          icon={AlertTriangle}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard
          icon={PackagePlus}
          title="Tambah Produk"
          description="Buka halaman master produk untuk menambah item baru."
          onClick={() => navigate("/admin/products")}
        />
        <QuickActionCard
          icon={ShoppingBasket}
          title="Tambah Paket"
          description="Kelola dan tambahkan package rental per tipe console."
          onClick={() => navigate("/admin/packages")}
        />
        <QuickActionCard
          icon={Wallet}
          title="Update Harga"
          description="Perbarui rental rate aktif untuk semua tipe console."
          onClick={() => navigate("/admin/rates")}
        />
        <QuickActionCard
          icon={UserPlus}
          title="Buat Akun Kasir"
          description="Masuk ke modul user admin untuk menyiapkan manajemen akun kasir."
          onClick={() => navigate("/admin/users")}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
        <RevenueChart items={data.revenueLast7Days} />
        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-violet-500/16 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
                  Estimasi Aktif
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Revenue Berjalan
                </h3>
              </div>
              <Wallet className="h-6 w-6 text-violet-300" />
            </div>
            <p className="font-display-number mt-6 text-[2.4rem] font-semibold text-violet-200">
              {formatRupiah(data.summary.activeRevenueEstimate)}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Estimasi gabungan transaksi aktif OPEN dan PACKAGE termasuk product total.
            </p>
          </div>

          <TopProductsCard items={data.topProducts} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <RecentTransactionsCard items={data.recentTransactions} />
        <CriticalProductsCard items={data.criticalProducts} />
      </section>

      {!data.revenueLast7Days.length &&
      !data.topProducts.length &&
      !data.recentTransactions.length &&
      !data.criticalProducts.length ? (
        <EmptyState
          title="Dashboard admin masih kosong"
          description="Belum ada data transaksi atau produk yang cukup untuk ditampilkan."
          className="border-white/10 bg-slate-950/40"
          titleClassName="text-white"
          descriptionClassName="text-slate-400"
        />
      ) : null}
    </div>
  );
}

export default AdminDashboardPage;
