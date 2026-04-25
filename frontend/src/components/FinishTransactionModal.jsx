import {
  Gamepad2,
  Receipt,
  ShoppingBasket,
  Timer,
  UserRound,
  X,
} from "lucide-react";

import {
  formatDateTime,
  formatClockDuration,
  formatRupiah,
} from "../lib/format.js";
import useNow from "../hooks/useNow.js";
import { getTransactionEstimate } from "../lib/billingEstimate.js";
import { theme } from "../lib/theme.js";

function getPackageLabel(transaction) {
  return transaction.packageNameSnapshot || "PACKAGE";
}

function FinishTransactionModal({ transaction, isSubmitting, onClose, onConfirm }) {
  const now = useNow(1000);

  if (!transaction) {
    return null;
  }

  const estimate = getTransactionEstimate(transaction, now);
  const rentalTotalPreview = estimate.estimatedRentalTotal;
  const productTotal = estimate.productTotal;
  const grandTotalPreview = estimate.estimatedGrandTotal;
  const items = transaction.items || [];
  const isPackage = transaction.pricingType === "PACKAGE";
  const packageDurationMinutes =
    transaction.packageDurationMinutesSnapshot ?? transaction.packageDurationSnapshot;
  const packageDurationSeconds = packageDurationMinutes ? packageDurationMinutes * 60 : 0;
  const packageLabel = isPackage ? getPackageLabel(transaction) : null;

  return (
    <div
      data-modal-root="true"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
    >
      <div className="dashboard-panel w-full max-w-4xl overflow-hidden">
        <div
          className="flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-6"
          style={{ borderColor: theme.colors.border }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Finish Transaction
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
              {transaction.playStationUnit?.code}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {transaction.customerName || "Walk-in Customer"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="app-button app-button--ghost min-h-11 w-11 p-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className="rounded-[14px] border p-4"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceSoft,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                    }}
                  >
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-muted)]">Console</p>
                    <p className="text-2xl font-semibold text-[var(--color-text)]">
                      {transaction.playStationUnit?.code}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {transaction.playStationUnit?.consoleType || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-[14px] border p-4"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceSoft,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.inUse,
                    }}
                  >
                    <Timer className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-muted)]">Durasi</p>
                    <p className="font-display-number text-2xl font-semibold text-[var(--color-text)]">
                      {formatClockDuration(estimate.displayElapsedSeconds)}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Mulai {formatDateTime(transaction.startTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-[16px] border p-5"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceSoft,
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div
                  className="rounded-[14px] border p-4"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                      style={{
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceSoft,
                        color: theme.colors.text,
                      }}
                    >
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-muted)]">Customer</p>
                      <p className="text-lg font-semibold text-[var(--color-text)]">
                        {transaction.customerName || "Walk-in Customer"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-[14px] border p-4"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                      style={{
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceSoft,
                        color: theme.colors.available,
                      }}
                    >
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-muted)]">Mode transaksi</p>
                      <p className="text-lg font-semibold text-[var(--color-text)]">
                        {isPackage && packageLabel
                          ? `${transaction.pricingType} • ${packageLabel}`
                          : transaction.pricingType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-[16px] border p-5"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceSoft,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                  }}
                >
                  <ShoppingBasket className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--color-text)]">Item produk</p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Pastikan semua snack dan minuman sudah tercatat sebelum transaksi ditutup.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
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
                      className="rounded-[14px] border px-4 py-4"
                      style={{
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surface,
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--color-text)]">
                            {item.productNameSnapshot || item.product?.name}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">
                            Qty {item.quantity} x {formatRupiah(item.unitPriceSnapshot)}
                          </p>
                        </div>
                        <span className="font-display-number text-base font-semibold text-[var(--color-text)]">
                          {formatRupiah(item.subtotalSnapshot)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div
              className="rounded-[14px] border p-4"
              style={{
                borderColor: theme.colors.inUse,
                backgroundColor: theme.colors.inUseSoft,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.available,
                  }}
                >
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Grand total</p>
                  <p className="font-display-number text-2xl font-semibold text-[var(--color-text)]">
                    {formatRupiah(grandTotalPreview)}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Final check sebelum billing ditutup
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-[16px] border p-5"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceSoft,
              }}
            >
              <div className="space-y-4 text-sm text-[var(--color-muted)]">
                <div className="flex items-center justify-between gap-3">
                  <span>Console type</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {transaction.playStationUnit?.consoleType || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Start time</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {formatDateTime(transaction.startTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Durasi berjalan</span>
                  <span className="font-display-number font-medium text-[var(--color-text)]">
                    {formatClockDuration(estimate.displayElapsedSeconds)}
                  </span>
                </div>
                {isPackage && packageDurationSeconds > 0 ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>Durasi paket</span>
                    <span className="font-display-number font-medium text-[var(--color-text)]">
                      {formatClockDuration(packageDurationSeconds)}
                    </span>
                  </div>
                ) : null}
                {isPackage ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>Durasi aktual</span>
                    <span className="font-display-number font-medium text-[var(--color-text)]">
                      {formatClockDuration(estimate.elapsedSeconds)}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <span>Tipe transaksi</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {transaction.pricingType}
                  </span>
                </div>
                {isPackage && packageLabel ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>Nama paket</span>
                    <span className="font-medium text-[var(--color-text)]">
                      {packageLabel}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <span>{isPackage ? "Harga paket" : "Rental total"}</span>
                  <span className="font-display-number font-medium text-[var(--color-text)]">
                    {formatRupiah(rentalTotalPreview)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Produk total</span>
                  <span className="font-display-number font-medium text-[var(--color-text)]">
                    {formatRupiah(productTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Jumlah item</span>
                  <span className="font-medium text-[var(--color-text)]">{items.length}</span>
                </div>
                <div
                  className="flex items-center justify-between gap-3 border-t pt-4 text-base"
                  style={{ borderColor: theme.colors.border }}
                >
                  <span className="font-medium text-[var(--color-text)]">Grand total</span>
                  <span className="font-display-number text-2xl font-bold text-[var(--color-available)]">
                    {formatRupiah(grandTotalPreview)}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="rounded-[16px] border p-5"
              style={{
                borderColor: theme.colors.maintenance,
                backgroundColor: theme.colors.maintenanceSoft,
              }}
            >
              <p className="text-sm leading-6 text-[var(--color-text)]">
                Setelah transaksi diselesaikan, console akan kembali AVAILABLE dan billing
                tidak bisa dilanjutkan lagi dari sesi ini.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="app-button app-button--ghost"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }

                  onConfirm();
                }}
                className={`app-button ${
                  isSubmitting ? "app-button--disabled" : "app-button--danger"
                }`}
              >
                {isSubmitting ? "Menyelesaikan..." : "Selesaikan Transaksi"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinishTransactionModal;
