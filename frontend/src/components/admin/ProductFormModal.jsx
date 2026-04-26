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
    <div className="admin-modal-backdrop">
      <div className="admin-modal max-w-xl">
        <div className="admin-modal-header">
          <div>
            <p className="admin-eyebrow">Kelola Produk</p>
            <h3 className="admin-title admin-title--section">
              {isEditMode ? "Edit Produk" : "Tambah Produk"}
            </h3>
            <p className="admin-description">
              Kelola data produk snack dan minuman untuk operasional kasir.
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
            <span className="text-sm font-medium text-[var(--admin-text)]">Nama produk</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Contoh: Fanta"
              className="admin-input"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--admin-text)]">Harga</span>
              <input
                type="number"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="6000"
                className="admin-input"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--admin-text)]">Stok</span>
              <input
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="20"
                className="admin-input"
                required
              />
            </label>
          </div>

          {isEditMode ? (
            <label className="flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--admin-border)] bg-[var(--admin-card-soft)] px-4 py-4">
              <div>
                <p className="font-medium text-[var(--admin-text)]">Status aktif</p>
                <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                  Nonaktifkan produk jika tidak ingin muncul di operasional.
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
              {isSubmitting ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;
