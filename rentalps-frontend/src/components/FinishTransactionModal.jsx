import { Receipt, Timer, X } from "lucide-react";

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

  const liveDuration = calculateLiveDurationMinutes(transaction.startTime);
  const rentalTotalPreview = calculateLiveRentalTotal(transaction);
  const grandTotalPreview = rentalTotalPreview + Number(transaction.productTotal || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.5)]">
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Estimasi durasi</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {liveDuration} menit
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
                  <p className="text-sm text-slate-500">Estimasi grand total</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    Rp{grandTotalPreview}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Tipe transaksi</span>
                <span className="font-semibold text-slate-950">
                  {transaction.pricingType}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Rental total</span>
                <span className="font-medium text-slate-950">Rp{rentalTotalPreview}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Produk total</span>
                <span className="font-medium text-slate-950">
                  Rp{transaction.productTotal}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3 text-base">
                <span className="font-medium text-slate-700">Grand total</span>
                <span className="font-semibold text-slate-950">
                  Rp{grandTotalPreview}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirm}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Menyelesaikan..." : "Konfirmasi Finish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinishTransactionModal;
