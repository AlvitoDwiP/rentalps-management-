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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">
              Package Form
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-white">
              {isEditMode ? "Edit Package" : "Tambah Package"}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              Kelola paket durasi rental untuk setiap tipe console.
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
            <span className="text-sm font-medium text-slate-200">Nama package</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Contoh: PS5 2 Jam"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Console type</span>
              <select
                name="consoleType"
                value={form.consoleType}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                required
              >
                {CONSOLE_TYPES.map((item) => (
                  <option key={item} value={item} className="bg-slate-950">
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
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                required
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Harga</span>
            <input
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="24000"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />
          </label>

          {isEditMode ? (
            <label className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <div>
                <p className="font-medium text-white">Status aktif</p>
                <p className="mt-1 text-sm text-slate-400">
                  Nonaktifkan package jika sudah tidak dipakai lagi di kasir.
                </p>
              </div>
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-orange-500"
              />
            </label>
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
