import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarRange, ReceiptText } from "lucide-react";
import { useState } from "react";

import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import SectionSkeleton from "../../components/SectionSkeleton.jsx";
import { getAdminReportsSummary } from "../../lib/api.js";
import { formatDateTime, formatRupiah } from "../../lib/format.js";

function getTodayDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getMonthStartDateString() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  })
    .formatToParts(new Date())
    .reduce((result, part) => {
      if (part.type === "year" || part.type === "month") {
        result[part.type] = part.value;
      }

      return result;
    }, {});

  return `${parts.year}-${parts.month}-01`;
}

function SummaryCard({ title, value, helper }) {
  return (
    <div className="admin-card">
      <p className="admin-eyebrow">{title}</p>
      <p className="font-display-number mt-5 text-[2.25rem] font-semibold leading-none text-[var(--admin-text)]">
        {value}
      </p>
      <p className="mt-3 text-sm text-[var(--admin-text-muted)]">{helper}</p>
    </div>
  );
}

function AdminReportsPage() {
  const today = getTodayDateString();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: today,
    endDate: today,
  });

  const reportsQuery = useQuery({
    queryKey: ["admin-reports-summary", appliedFilters],
    queryFn: () => getAdminReportsSummary(appliedFilters),
  });

  const data = reportsQuery.data || {
    summary: {
      totalRevenue: 0,
      transactionCount: 0,
      rentalRevenue: 0,
      productRevenue: 0,
      openTransactionCount: 0,
      packageTransactionCount: 0,
    },
    topProducts: [],
    transactions: [],
  };

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleApply() {
    setAppliedFilters({
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    });
  }

  function handleToday() {
    const nextToday = getTodayDateString();

    setFilters({
      startDate: nextToday,
      endDate: nextToday,
    });
    setAppliedFilters({
      startDate: nextToday,
      endDate: nextToday,
    });
  }

  function handleMonth() {
    const nextToday = getTodayDateString();
    const monthStart = getMonthStartDateString();

    setFilters({
      startDate: monthStart,
      endDate: nextToday,
    });
    setAppliedFilters({
      startDate: monthStart,
      endDate: nextToday,
    });
  }

  if (reportsQuery.isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-state-surface rounded-[1rem] p-5">
          <SectionSkeleton variant="grid" count={6} />
        </div>
        <div className="admin-state-surface rounded-[1rem] p-5">
          <SectionSkeleton variant="list" count={2} />
        </div>
      </div>
    );
  }

  if (reportsQuery.isError) {
    return (
      <ErrorState
        title="Laporan belum bisa dimuat"
        description="Data ringkasan laporan gagal diambil. Coba muat ulang atau ubah periode."
        onRetry={() => reportsQuery.refetch()}
        className="admin-state-surface bg-[rgba(255,138,138,0.12)]"
        titleClassName="text-[var(--admin-danger)]"
        descriptionClassName="text-[var(--admin-text-muted)]"
        retryClassName="bg-[var(--admin-purple)] hover:bg-[var(--admin-purple-hover)]"
      />
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header-card">
        <div className="admin-header-card__row">
          <div>
            <p className="admin-eyebrow">Laporan</p>
            <h1 className="admin-title">Laporan</h1>
            <p className="admin-description">
              Ringkasan performa rental berdasarkan periode.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-soft)] px-4 py-3 text-sm text-[var(--admin-text-muted)]">
            <CalendarRange className="h-4 w-4 text-[var(--admin-link)]" />
            <span>
              {appliedFilters.startDate || today} s/d {appliedFilters.endDate || today}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-filter-bar">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="admin-eyebrow">Filter Tanggal</p>
            <h2 className="admin-title admin-title--section">Pilih Periode Laporan</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleToday}
              className="admin-button admin-button--secondary"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={handleMonth}
              className="admin-button admin-button--secondary"
            >
              Bulan Ini
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-text)]">Start Date</span>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="admin-input"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-text)]">End Date</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="admin-input"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleApply}
              className="admin-button admin-button--primary w-full lg:w-auto"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Revenue"
          value={formatRupiah(data.summary.totalRevenue)}
          helper="Akumulasi grand total transaksi selesai"
        />
        <SummaryCard
          title="Jumlah Transaksi"
          value={String(data.summary.transactionCount)}
          helper="Total transaksi completed pada periode"
        />
        <SummaryCard
          title="Rental Revenue"
          value={formatRupiah(data.summary.rentalRevenue)}
          helper="Akumulasi pendapatan rental"
        />
        <SummaryCard
          title="Product Revenue"
          value={formatRupiah(data.summary.productRevenue)}
          helper="Akumulasi pendapatan produk"
        />
        <SummaryCard
          title="OPEN Count"
          value={String(data.summary.openTransactionCount)}
          helper="Jumlah transaksi OPEN selesai"
        />
        <SummaryCard
          title="PACKAGE Count"
          value={String(data.summary.packageTransactionCount)}
          helper="Jumlah transaksi PACKAGE selesai"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="admin-section">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-eyebrow">Top Products</p>
              <h2 className="admin-title admin-title--section">Produk Terlaris</h2>
            </div>
            <BarChart3 className="h-6 w-6 text-[#ddcdff]" />
          </div>

          {data.topProducts.length === 0 ? (
            <EmptyState
              title="Belum ada produk terjual"
              description="Top produk akan muncul setelah ada transaksi completed dengan item pada periode ini."
              className="admin-state-surface"
              titleClassName="text-[var(--admin-text)]"
              descriptionClassName="text-[var(--admin-text-muted)]"
            />
          ) : (
            <div className="admin-table-wrap">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Quantity</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((item) => (
                      <tr key={item.id} className="admin-table-row">
                        <td className="font-medium text-[var(--admin-text)]">{item.name}</td>
                        <td className="admin-number">{item.quantitySold}</td>
                        <td className="admin-number">{formatRupiah(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="admin-section">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-eyebrow">Transactions</p>
              <h2 className="admin-title admin-title--section">Transaksi Selesai</h2>
            </div>
            <ReceiptText className="h-6 w-6 text-[#ddcdff]" />
          </div>

          {data.transactions.length === 0 ? (
            <EmptyState
              title="Belum ada transaksi"
              description="Transaksi completed pada periode ini akan muncul di sini."
              className="admin-state-surface"
              titleClassName="text-[var(--admin-text)]"
              descriptionClassName="text-[var(--admin-text-muted)]"
            />
          ) : (
            <div className="admin-table-wrap">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Waktu Selesai</th>
                      <th>Console</th>
                      <th>Tipe</th>
                      <th>Rental</th>
                      <th>Produk</th>
                      <th>Grand Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((transaction) => (
                      <tr key={transaction.id} className="admin-table-row">
                        <td>{formatDateTime(transaction.endTime)}</td>
                        <td className="font-medium text-[var(--admin-text)]">
                          {transaction.consoleCode}
                        </td>
                        <td>{transaction.pricingType}</td>
                        <td className="admin-number">{formatRupiah(transaction.rentalTotal)}</td>
                        <td className="admin-number">{formatRupiah(transaction.productTotal)}</td>
                        <td className="admin-number">{formatRupiah(transaction.grandTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminReportsPage;
