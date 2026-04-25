import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, History, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";

import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import SectionSkeleton from "../components/SectionSkeleton.jsx";
import { getTransactionHistory } from "../lib/api.js";
import { formatDateTime, formatDuration, formatRupiah } from "../lib/format.js";
import { theme } from "../lib/theme.js";

function HistoryItem({ transaction }) {
  const packageLabel =
    transaction.pricingType === "PACKAGE"
      ? transaction.packageNameSnapshot || "PACKAGE"
      : null;

  return (
    <article className="transaction-card rounded-[16px] px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--color-text)]">
              {transaction.console?.code || "-"}
            </h3>
            <span
              className="mode-badge mode-badge--package"
              style={{
                backgroundColor:
                  transaction.pricingType === "OPEN"
                    ? theme.colors.inUseSoft
                    : "rgba(255, 255, 255, 0.04)",
                color:
                  transaction.pricingType === "OPEN"
                    ? theme.colors.inUse
                    : theme.colors.text,
              }}
            >
              {transaction.pricingType}
            </span>
          </div>

          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Selesai {formatDateTime(transaction.endTime)}
          </p>
          <p className="mt-3 truncate text-[1rem] text-[var(--color-text)]">
            {transaction.customerName || "Walk-in Customer"}
          </p>
          {packageLabel ? (
            <p className="mt-2 truncate text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
              {packageLabel}
            </p>
          ) : null}
        </div>

        <div className="min-w-[120px] text-right">
          <p className="text-sm text-[var(--color-muted)]">Grand Total</p>
          <p className="font-display-number mt-1 text-[1.2rem] font-semibold text-[var(--color-available)]">
            {formatRupiah(transaction.grandTotal)}
          </p>
        </div>
      </div>

      <div
        className="mt-4 grid gap-3 border-t pt-4 text-sm text-[var(--color-muted)] sm:grid-cols-4"
        style={{ borderColor: theme.colors.border }}
      >
        <div>
          <p>Console</p>
          <p className="mt-1 font-medium text-[var(--color-text)]">
            {transaction.console?.consoleType || "-"}
          </p>
        </div>
        <div>
          <p>Durasi</p>
          <p className="mt-1 font-medium text-[var(--color-text)]">
            {formatDuration(transaction.durationMinutes)}
          </p>
        </div>
        <div>
          <p>Rental</p>
          <p className="font-display-number mt-1 font-medium text-[var(--color-text)]">
            {formatRupiah(transaction.rentalTotal)}
          </p>
        </div>
        <div>
          <p>Produk</p>
          <p className="font-display-number mt-1 font-medium text-[var(--color-text)]">
            {formatRupiah(transaction.productTotal)}
          </p>
        </div>
      </div>
    </article>
  );
}

function HistoryPage() {
  const navigate = useNavigate();

  const historyQuery = useQuery({
    queryKey: ["transaction-history"],
    queryFn: () => getTransactionHistory({ limit: 20, page: 1 }),
    staleTime: 5000,
  });

  const historyData = historyQuery.data || {
    items: [],
    pagination: {
      page: 1,
      limit: 20,
      count: 0,
    },
  };
  const transactions = historyData.items;
  const pagination = historyData.pagination;

  return (
    <main className="dashboard-shell">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-5">
        <header className="dashboard-panel dashboard-panel--header overflow-hidden">
          <div
            className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 sm:px-6"
            style={{
              backgroundColor: "rgba(255,255,255,0.02)",
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="app-button app-button--ghost gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-[12px]"
                    style={{
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                    }}
                  >
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--color-text)]">
                      Riwayat Transaksi
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Daftar transaksi selesai terbaru untuk kasir dan admin.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-3 rounded-[14px] border px-4 py-3"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceSoft,
              }}
            >
              <ReceiptText className="h-5 w-5 text-[var(--color-text)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Total Ditampilkan
                </p>
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  {pagination.count}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="dashboard-panel p-5 sm:p-6">
          {historyQuery.isLoading ? (
            <SectionSkeleton variant="list" count={4} />
          ) : historyQuery.isError ? (
            <ErrorState
              title="Riwayat transaksi gagal dimuat"
              description="Data transaksi selesai belum bisa diambil saat ini. Coba muat ulang halaman ini."
              retryLabel="Coba Lagi"
              onRetry={() => historyQuery.refetch()}
              className="border-[var(--color-maintenance)] bg-[var(--color-maintenance-soft)]"
            />
          ) : transactions.length === 0 ? (
            <EmptyState
              title="Belum ada transaksi selesai"
              description="Riwayat akan muncul setelah ada transaksi yang diselesaikan dari dashboard kasir."
              className="border-[var(--color-border)] bg-[var(--color-surface-soft)]"
              titleClassName="text-[var(--color-text)]"
              descriptionClassName="text-[var(--color-muted)]"
            />
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <HistoryItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default HistoryPage;
