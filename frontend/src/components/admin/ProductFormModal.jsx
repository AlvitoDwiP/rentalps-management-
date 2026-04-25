import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  name: "",
  price: "",
  stock: "",
  isActive: true,
};

function ProductFormModal({ product, isSubmitting, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!product) {
      setForm(initialForm);
      return;
    }

    setForm({
      name: product.name || "",
      price: String(Number(product.price || 0)),
      stock: String(Number(product.stock || 0)),
      isActive: product.isActive ?? true,
    });
  }, [product]);

  const isEditMode = Boolean(product);

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
      price: Number(form.price),
      stock: Number(form.stock),
      isActive: form.isActive,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">
              Product Form
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-white">
              {isEditMode ? "Edit Produk" : "Tambah Produk"}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              Kelola data produk snack dan minuman untuk operasional kasir.
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
            <span className="text-sm font-medium text-slate-200">Nama produk</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Contoh: Fanta"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Harga</span>
              <input
                type="number"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="6000"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Stok</span>
              <input
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="20"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                required
              />
            </label>
          </div>

          {isEditMode ? (
            <label className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <div>
                <p className="font-medium text-white">Status aktif</p>
                <p className="mt-1 text-sm text-slate-400">
                  Nonaktifkan produk jika tidak ingin muncul di operasional.
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
              {isSubmitting ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;
