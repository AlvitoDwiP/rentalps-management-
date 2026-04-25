import { ArrowRightLeft, Coffee, ReceiptText, X } from "lucide-react";

import useNow from "../hooks/useNow.js";
import { getTransactionEstimate } from "../lib/billingEstimate.js";
import { formatClockDuration, formatRupiah } from "../lib/format.js";
import { theme } from "../lib/theme.js";
import EmptyState from "./EmptyState.jsx";
import ErrorState from "./ErrorState.jsx";
import SectionSkeleton from "./SectionSkeleton.jsx";

function getPricingBadgeClass(pricingType) {
  return pricingType === "PACKAGE" ? "mode-badge mode-badge--package" : "mode-badge mode-badge--open";
}

function TransactionListItem({ transaction, isSelected, onSelect, now }) {
  const estimate = getTransactionEstimate(transaction, now);

  return (
    <button
      type="button"
      onClick={() => onSelect(transaction)}
      className={`transaction-card w-full rounded-[16px] px-5 py-4 text-left ${
        isSelected ? "transaction-card--selected" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[1.9rem] font-semibold tracking-[-0.05em] text-[var(--color-text)]">
              {transaction.playStationUnit?.code}
            </h3>
            <span className={getPricingBadgeClass(transaction.pricingType)}>
              {transaction.pricingType}
            </span>
          </div>
          <p className="font-display-number mt-3 text-[2.15rem] font-semibold leading-none text-[var(--color-text)]">
            {formatClockDuration(estimate.elapsedSeconds)}
          </p>
          <p className="mt-3 truncate text-[1.05rem] text-[var(--color-text)]">
            {transaction.customerName || "Walk-in Customer"}
          </p>
        </div>

        <p className="text-sm font-semibold text-[var(--color-muted)]">
          #{transaction.code || transaction.id.slice(0, 8)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
        <span>Grand Total (est.)</span>
        <span className="font-display-number font-medium text-[var(--color-text)]">
          {formatRupiah(estimate.estimatedGrandTotal)}
        </span>
      </div>
    </button>
  );
}

function TransactionDetail({
  transaction,
  now,
  onAddItem,
  onMoveConsole,
  onFinish,
}) {
  if (!transaction) {
    return (
      <EmptyState
        title="Pilih transaksi aktif"
        description="Klik salah satu transaksi di daftar atau pilih console yang sedang IN_USE dari grid kiri."
        className="border-[var(--color-border)] bg-[var(--color-surface-soft)]"
        titleClassName="text-[var(--color-text)]"
        descriptionClassName="text-[var(--color-muted)]"
      />
    );
  }

  const items = transaction.items || [];
  const estimate = getTransactionEstimate(transaction, now);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[1.05rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Detail #{transaction.code || transaction.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {items.length === 0 ? (
          <div
            className="rounded-[14px] border px-4 py-5 text-sm"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              color: theme.colors.muted,
            }}
          >
            Belum ada item produk di transaksi ini.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 border-b pb-3"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="min-w-0">
                <p className="truncate text-[1.05rem] font-medium text-[var(--color-text)]">
                  {item.productNameSnapshot || item.product?.name}
                </p>
              </div>
              <span className="text-sm text-[var(--color-muted)]">x{item.quantity}</span>
              <span className="font-display-number text-[1.05rem] font-medium text-[var(--color-text)]">
                {formatRupiah(item.subtotalSnapshot)}
              </span>
            </div>
          ))
        )}

        <div className="space-y-3 pt-2 text-[1.05rem]">
          <div className="flex items-center justify-between gap-3 text-[var(--color-muted)]">
            <span>Rental (est.)</span>
            <span className="font-display-number text-[var(--color-text)]">
              {formatRupiah(estimate.estimatedRentalTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[var(--color-muted)]">
            <span>Produk</span>
            <span className="font-display-number text-[var(--color-text)]">
              {formatRupiah(estimate.productTotal)}
            </span>
          </div>
          <div className="grand-total-box mt-3 flex items-center justify-between gap-3 px-4 py-4">
            <span className="text-[1rem] font-semibold text-[var(--color-text)]">
              Grand Total
            </span>
            <span className="grand-total-value font-display-number text-[2.65rem] font-semibold leading-none text-[var(--color-available)]">
              {formatRupiah(estimate.estimatedGrandTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1.1fr_92px]">
        <button
          type="button"
          onClick={() => onAddItem(transaction)}
          className="app-button app-button--ghost gap-2 text-lg"
        >
          <Coffee className="h-5 w-5" />
          + Produk
        </button>
        <button
          type="button"
          onClick={() => onFinish(transaction)}
          className="app-button app-button--primary gap-2 text-lg"
        >
          <ReceiptText className="h-5 w-5" />
          Selesaikan
        </button>
        <button
          type="button"
          onClick={() => onMoveConsole(transaction)}
          className="app-button app-button--ghost gap-2"
          aria-label="Move Console"
        >
          <ArrowRightLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function ActiveTransactionPanel({
  transactions,
  selectedTransaction,
  isLoading,
  isError,
  onClose,
  onRetry,
  onSelectTransaction,
  onFinish,
  onAddItem,
  onMoveConsole,
}) {
  const now = useNow(1000);

  return (
    <section className="dashboard-panel overflow-hidden">
      <div
        className="border-b px-5 py-4 sm:px-6"
        style={{ borderColor: theme.colors.border }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">
              Transaksi Aktif
            </h2>
            <span
              className="inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-semibold"
              style={{
                backgroundColor: theme.colors.inUse,
                color: theme.colors.text,
              }}
            >
              {transactions.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="panel-close-button"
            aria-label="Tutup panel transaksi aktif"
            title="Tutup panel (Esc atau D)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {isLoading ? (
          <SectionSkeleton variant="list" count={4} />
        ) : isError ? (
          <ErrorState
            title="Transaksi aktif gagal dimuat"
            description="Panel transaksi belum bisa mengambil data terbaru. Coba muat ulang panel ini."
            onRetry={onRetry}
            className="border-[var(--color-maintenance)] bg-[var(--color-maintenance-soft)]"
          />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Belum ada transaksi aktif"
            description="Pilih console yang available di grid kiri untuk mulai billing baru."
            className="border-[var(--color-border)] bg-[var(--color-surface-soft)]"
            titleClassName="text-[var(--color-text)]"
            descriptionClassName="text-[var(--color-muted)]"
          />
        ) : (
          <div className="space-y-6">
            <div className="max-h-[540px] space-y-4 overflow-y-auto pr-1">
              {transactions.map((transaction) => (
                <TransactionListItem
                  key={transaction.id}
                  transaction={transaction}
                  isSelected={selectedTransaction?.id === transaction.id}
                  onSelect={onSelectTransaction}
                  now={now}
                />
              ))}
            </div>

            <div className="transaction-panel-divider" />

            <div
              className="rounded-[16px] border px-5 py-6 sm:px-6"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              <TransactionDetail
                transaction={selectedTransaction}
                now={now}
                onAddItem={onAddItem}
                onMoveConsole={onMoveConsole}
                onFinish={onFinish}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ActiveTransactionPanel;
