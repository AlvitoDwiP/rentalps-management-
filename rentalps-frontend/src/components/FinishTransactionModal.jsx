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
  formatDuration,
  formatRupiah,
} from "../lib/format.js";

function calculateLiveDurationMinutes(startTime) {
  const diffMs = Date.now() - new Date(startTime).getTime();

  if (diffMs <= 0) {
    return 0;
  }

  return Math.ceil(diffMs / 60000);
}

function calculateLiveRentalTotal(transaction) {
  if (transaction.pricingType === "PACKAGE") {
    return transaction.rentalTotal;
  }

  const durationMinutes = calculateLiveDurationMinutes(transaction.startTime);

  if (!durationMinutes) {
    return 0;
  }

  return Math.ceil((Number(transaction.hourlyRateSnapshot) * durationMinutes) / 60);
}

function FinishTransactionModal({ transaction, isSubmitting, onClose, onConfirm }) {
  if (!transaction) {
    return null;
  }

  const durationMinutes = transaction.durationMinutes ?? calculateLiveDurationMinutes(
    transaction.startTime,
  );
  const rentalTotalPreview =
    transaction.status === "COMPLETED"
      ? Number(transaction.rentalTotal || 0)
      : calculateLiveRentalTotal(transaction);
  const productTotal = Number(transaction.productTotal || 0);
  const grandTotalPreview = rentalTotalPreview + productTotal;
  const items = transaction.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.5)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
              Finish Transaction
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-950">
              {transaction.playStationUnit?.code}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {transaction.customerName || "Walk-in Customer"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Console</p>
                    <p className="text-2xl font-semibold text-slate-950">
                      {transaction.playStationUnit?.code}
                    </p>
                    <p className="text-sm text-slate-500">
                      {transaction.playStationUnit?.consoleType || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Timer className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Durasi</p>
                    <p className="text-2xl font-semibold text-slate-950">
                      {formatDuration(durationMinutes)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Mulai {formatDateTime(transaction.startTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Customer</p>
                      <p className="text-lg font-semibold text-slate-950">
                        {transaction.customerName || "Walk-in Customer"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Mode transaksi</p>
                      <p className="text-lg font-semibold text-slate-950">
                        {transaction.pricingType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <ShoppingBasket className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-950">Item produk</p>
                  <p className="text-sm text-slate-500">
                    Pastikan semua snack dan minuman sudah tercatat sebelum transaksi ditutup.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Belum ada item produk di transaksi ini.
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {item.productNameSnapshot || item.product?.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Qty {item.quantity} x {formatRupiah(item.unitPriceSnapshot)}
                          </p>
                        </div>
                        <span className="text-base font-semibold text-slate-950">
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
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Grand total</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {formatRupiah(grandTotalPreview)}
                  </p>
                  <p className="text-sm text-slate-500">Final check sebelum billing ditutup</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Console type</span>
                  <span className="font-medium text-slate-950">
                    {transaction.playStationUnit?.consoleType || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Start time</span>
                  <span className="font-medium text-slate-950">
                    {formatDateTime(transaction.startTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Durasi berjalan</span>
                  <span className="font-medium text-slate-950">
                    {formatDuration(durationMinutes)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Tipe transaksi</span>
                  <span className="font-semibold text-slate-950">
                    {transaction.pricingType}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Rental total</span>
                  <span className="font-medium text-slate-950">
                    {formatRupiah(rentalTotalPreview)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Produk total</span>
                  <span className="font-medium text-slate-950">
                    {formatRupiah(productTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Jumlah item</span>
                  <span className="font-medium text-slate-950">{items.length}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-4 text-base">
                  <span className="font-medium text-slate-700">Grand total</span>
                  <span className="text-2xl font-bold text-rose-600">
                    {formatRupiah(grandTotalPreview)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5">
              <p className="text-sm leading-6 text-rose-700">
                Setelah transaksi diselesaikan, console akan kembali AVAILABLE dan billing
                tidak bisa dilanjutkan lagi dari sesi ini.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onConfirm}
                  className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Menyelesaikan..." : "Selesaikan Transaksi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinishTransactionModal;
