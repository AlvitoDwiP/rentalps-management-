import { useEffect, useState } from "react";
import { X } from "lucide-react";

function RateFormModal({
  rentalRate,
  isSubmitting,
  validationError,
  onClose,
  onSubmit,
}) {
  const [pricePerHour, setPricePerHour] = useState("");

  useEffect(() => {
    if (!rentalRate) {
      setPricePerHour("");
      return;
    }

    setPricePerHour(String(Number(rentalRate.hourlyRate || 0)));
  }, [rentalRate]);

  if (!rentalRate) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    onSubmit({
      pricePerHour: Number(pricePerHour),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">
              Rental Rate
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-white">
              Edit Harga Rental
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              Perbarui harga rental per jam tanpa mengubah histori transaksi lama.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Console type</span>
            <input
              type="text"
              value={rentalRate.consoleType}
              readOnly
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-300 outline-none"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Price per hour</span>
            <input
              type="number"
              min="0"
              value={pricePerHour}
              onChange={(event) => setPricePerHour(event.target.value)}
              disabled={isSubmitting}
              placeholder="12000"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />
          </label>

          {typeof rentalRate.isActive === "boolean" ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="font-medium text-white">Status rate</p>
              <p className="mt-1 text-sm text-slate-400">
                {rentalRate.isActive ? "Aktif" : "Nonaktif"}
              </p>
            </div>
          ) : null}

          {validationError ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {validationError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Harga"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RateFormModal;
