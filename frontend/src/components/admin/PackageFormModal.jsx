import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  name: "",
  consoleType: "PS5",
  durationMinutes: "",
  price: "",
  isActive: true,
};

const CONSOLE_TYPES = ["PS3", "PS4", "PS5"];

function PackageFormModal({
  rentalPackage,
  isSubmitting,
  validationError,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!rentalPackage) {
      setForm(initialForm);
      return;
    }

    setForm({
      name: rentalPackage.name || "",
      consoleType: rentalPackage.consoleType || "PS5",
      durationMinutes: String(Number(rentalPackage.durationMinutes || 0)),
      price: String(Number(rentalPackage.price || 0)),
      isActive: rentalPackage.isActive ?? true,
    });
  }, [rentalPackage]);

  const isEditMode = Boolean(rentalPackage);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    onSubmit({
      name: form.name.trim(),
      consoleType: form.consoleType,
      durationMinutes: Number(form.durationMinutes),
      price: Number(form.price),
      isActive: form.isActive,
    });
  }

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal max-w-xl">
        <div className="admin-modal-header">
          <div>
            <p className="admin-eyebrow">Kelola Paket</p>
            <h3 className="admin-title admin-title--section">
              {isEditMode ? "Edit Paket" : "Tambah Paket"}
            </h3>
            <p className="admin-description">
              Kelola paket durasi rental untuk setiap tipe console.
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
            <span className="text-sm font-medium text-[var(--admin-text)]">Nama paket</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Contoh: PS5 2 Jam"
              className="admin-input"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--admin-text)]">Console type</span>
              <select
                name="consoleType"
                value={form.consoleType}
                onChange={handleChange}
                disabled={isSubmitting}
                className="admin-select"
                required
              >
                {CONSOLE_TYPES.map((item) => (
                  <option key={item} value={item} className="bg-[#1f1f1b]">
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">
                Durasi (menit)
              </span>
              <input
                type="number"
                min="1"
                name="durationMinutes"
                value={form.durationMinutes}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="120"
                className="admin-input"
                required
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-text)]">Harga</span>
            <input
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="24000"
              className="admin-input"
              required
            />
          </label>

          {isEditMode ? (
            <label className="flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--admin-border)] bg-[var(--admin-card-soft)] px-4 py-4">
              <div>
                <p className="font-medium text-[var(--admin-text)]">Status aktif</p>
                <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                  Nonaktifkan package jika sudah tidak dipakai lagi di kasir.
                </p>
              </div>
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-[var(--admin-purple)]"
              />
            </label>
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
              {isSubmitting
                ? "Menyimpan..."
                : isEditMode
                  ? "Simpan Perubahan"
                  : "Tambah Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PackageFormModal;
