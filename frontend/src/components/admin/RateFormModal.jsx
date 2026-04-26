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
    <div className="admin-modal-backdrop">
      <div className="admin-modal max-w-xl">
        <div className="admin-modal-header">
          <div>
            <p className="admin-eyebrow">Harga Rental</p>
            <h3 className="admin-title admin-title--section">Edit Harga Rental</h3>
            <p className="admin-description">
              Perbarui harga rental per jam tanpa mengubah histori transaksi lama.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="admin-button admin-button--ghost h-11 w-11 px-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-text)]">Console type</span>
            <input
              type="text"
              value={rentalRate.consoleType}
              readOnly
              className="admin-input text-[var(--admin-text-muted)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-text)]">Price per hour</span>
            <input
              type="number"
              min="0"
              value={pricePerHour}
              onChange={(event) => setPricePerHour(event.target.value)}
              disabled={isSubmitting}
              placeholder="12000"
              className="admin-input"
              required
            />
          </label>

          {typeof rentalRate.isActive === "boolean" ? (
            <div className="rounded-[1rem] border border-[var(--admin-border)] bg-[var(--admin-card-soft)] px-4 py-4">
              <p className="font-medium text-[var(--admin-text)]">Status rate</p>
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                {rentalRate.isActive ? "Aktif" : "Nonaktif"}
              </p>
            </div>
          ) : null}

          {validationError ? (
            <div className="rounded-[1rem] border border-[rgba(255,138,138,0.3)] bg-[rgba(255,138,138,0.12)] px-4 py-3 text-sm text-[var(--admin-danger)]">
              {validationError}
            </div>
          ) : null}
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="admin-button admin-button--secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-button admin-button--primary"
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
