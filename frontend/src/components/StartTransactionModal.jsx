import { useEffect, useState } from "react";
import { BadgeDollarSign, Clock3, X } from "lucide-react";

import { formatRupiah } from "../lib/format.js";
import { theme } from "../lib/theme.js";
import EmptyState from "./EmptyState.jsx";

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

    if (isSubmitting) {
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="dashboard-panel w-full max-w-2xl overflow-hidden">
        <div
          className="flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-6"
          style={{ borderColor: theme.colors.border }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Start Transaction
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
              {consoleUnit.code}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Tipe {consoleUnit.consoleType} siap dipakai untuk billing baru.
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

        <form onSubmit={handleSubmit} className="space-y-6 px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("OPEN")}
              disabled={isSubmitting}
              className="rounded-[14px] border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor: mode === "OPEN" ? theme.colors.inUse : theme.colors.border,
                backgroundColor: mode === "OPEN" ? theme.colors.inUseSoft : theme.colors.surfaceSoft,
                color: theme.colors.text,
              }}
            >
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5" />
                <div>
                  <p className="font-semibold">OPEN</p>
                  <p className="text-sm text-[var(--color-muted)]">Billing jalan per menit</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode("PACKAGE")}
              disabled={isSubmitting}
              className="rounded-[14px] border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor:
                  mode === "PACKAGE" ? theme.colors.available : theme.colors.border,
                backgroundColor:
                  mode === "PACKAGE"
                    ? theme.colors.availableSoft
                    : theme.colors.surfaceSoft,
                color: theme.colors.text,
              }}
            >
              <div className="flex items-center gap-3">
                <BadgeDollarSign className="h-5 w-5" />
                <div>
                  <p className="font-semibold">PACKAGE</p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Pilih durasi tetap lebih cepat
                  </p>
                </div>
              </div>
            </button>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--color-text)]">Nama customer</span>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              disabled={isSubmitting}
              placeholder="Opsional, contoh: Budi"
              className="panel-input"
            />
          </label>

          {mode === "PACKAGE" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  Pilih package
                </span>
                {isPackagesLoading ? (
                  <span className="text-xs text-[var(--color-muted)]">Memuat package...</span>
                ) : null}
              </div>

              <div className="grid gap-3">
                {filteredPackages.length === 0 ? (
                  <EmptyState
                    title="Belum ada package aktif"
                    description={`Belum ada package aktif untuk ${consoleUnit.consoleType}.`}
                    className="rounded-[14px] border-[var(--color-border)] bg-[var(--color-surface-soft)]"
                    titleClassName="text-[var(--color-text)]"
                    descriptionClassName="text-[var(--color-muted)]"
                  />
                ) : (
                  filteredPackages.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center justify-between rounded-[14px] border px-4 py-4 transition"
                      style={{
                        borderColor:
                          packageId === item.id ? theme.colors.available : theme.colors.border,
                        backgroundColor:
                          packageId === item.id
                            ? theme.colors.availableSoft
                            : theme.colors.surfaceSoft,
                      }}
                    >
                      <div>
                        <p className="font-semibold text-[var(--color-text)]">{item.name}</p>
                        <p className="text-sm text-[var(--color-muted)]">
                          {item.durationMinutes} menit
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-display-number text-sm font-semibold text-[var(--color-text)]">
                          {formatRupiah(item.price)}
                        </span>
                        <input
                          type="radio"
                          name="packageId"
                          checked={packageId === item.id}
                          disabled={isSubmitting}
                          onChange={() => setPackageId(item.id)}
                        />
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          ) : null}

          <div
            className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end"
            style={{ borderColor: theme.colors.border }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="app-button app-button--ghost"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (mode === "PACKAGE" && (!packageId || filteredPackages.length === 0))
              }
              className={`app-button ${
                isSubmitting ||
                (mode === "PACKAGE" && (!packageId || filteredPackages.length === 0))
                  ? "app-button--disabled"
                  : "app-button--primary"
              }`}
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
