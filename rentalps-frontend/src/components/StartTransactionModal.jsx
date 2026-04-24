import { useEffect, useState } from "react";
import { BadgeDollarSign, Clock3, X } from "lucide-react";

function StartTransactionModal({
  consoleUnit,
  packages,
  isSubmitting,
  isPackagesLoading,
  onClose,
  onSubmit,
}) {
  const [mode, setMode] = useState("OPEN");
  const [customerName, setCustomerName] = useState("");
  const [packageId, setPackageId] = useState("");

  useEffect(() => {
    if (!consoleUnit) {
      setMode("OPEN");
      setCustomerName("");
      setPackageId("");
      return;
    }

    setMode("OPEN");
    setCustomerName("");
    setPackageId("");
  }, [consoleUnit]);

  if (!consoleUnit) {
    return null;
  }

  const filteredPackages = packages.filter(
    (item) => item.consoleType === consoleUnit.consoleType && item.isActive,
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (mode === "PACKAGE") {
      onSubmit({
        mode,
        consoleCode: consoleUnit.code,
        customerName,
        packageId,
      });
      return;
    }

    onSubmit({
      mode,
      consoleCode: consoleUnit.code,
      customerName,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.5)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
              Start Transaction
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-950">
              {consoleUnit.code}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Tipe {consoleUnit.consoleType} siap dipakai untuk billing baru.
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

        <form onSubmit={handleSubmit} className="space-y-6 px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("OPEN")}
              className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                mode === "OPEN"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5" />
                <div>
                  <p className="font-semibold">OPEN</p>
                  <p className="text-sm opacity-80">Billing jalan per menit</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode("PACKAGE")}
              className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                mode === "PACKAGE"
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <BadgeDollarSign className="h-5 w-5" />
                <div>
                  <p className="font-semibold">PACKAGE</p>
                  <p className="text-sm opacity-80">Pilih durasi tetap lebih cepat</p>
                </div>
              </div>
            </button>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Nama customer</span>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Opsional, contoh: Budi"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </label>

          {mode === "PACKAGE" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">Pilih package</span>
                {isPackagesLoading ? (
                  <span className="text-xs text-slate-400">Memuat package...</span>
                ) : null}
              </div>

              <div className="grid gap-3">
                {filteredPackages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Belum ada package aktif untuk {consoleUnit.consoleType}.
                  </div>
                ) : (
                  filteredPackages.map((item) => (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition ${
                        packageId === item.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.durationMinutes} menit
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-900">
                          Rp{item.price}
                        </span>
                        <input
                          type="radio"
                          name="packageId"
                          checked={packageId === item.id}
                          onChange={() => setPackageId(item.id)}
                        />
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (mode === "PACKAGE" && (!packageId || filteredPackages.length === 0))
              }
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Mulai Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StartTransactionModal;
