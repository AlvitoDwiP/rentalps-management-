import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import SectionSkeleton from "../../components/SectionSkeleton.jsx";
import ProductFormModal from "../../components/admin/ProductFormModal.jsx";
import {
  createAdminProductRequest,
  deleteAdminProductRequest,
  getApiErrorMessage,
  getProducts,
  updateAdminProductRequest,
} from "../../lib/api.js";
import { formatRupiah } from "../../lib/format.js";

function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(undefined);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const createMutation = useMutation({
    mutationFn: createAdminProductRequest,
    onSuccess: async () => {
      toast.success("Produk berhasil ditambahkan.");
      setEditingProduct(undefined);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminProductRequest,
    onSuccess: async () => {
      toast.success("Produk berhasil diperbarui.");
      setEditingProduct(undefined);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProductRequest,
    onSuccess: async () => {
      toast.success("Produk berhasil dinonaktifkan.");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const products = productsQuery.data || [];

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedSearch),
    );
  }, [products, search]);

  function handleOpenCreate() {
    setEditingProduct(null);
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
  }

  async function handleSubmit(formData) {
    if (editingProduct) {
      await updateMutation.mutateAsync({
        id: editingProduct.id,
        payload: {
          name: formData.name,
          price: formData.price,
          stock: formData.stock,
          isActive: formData.isActive,
        },
      });
      return;
    }

    await createMutation.mutateAsync({
      name: formData.name,
      price: formData.price,
      stock: formData.stock,
    });
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Nonaktifkan produk "${product.name}" dari daftar operasional?`,
    );

    if (!confirmed || deleteMutation.isPending) {
      return;
    }

    await deleteMutation.mutateAsync(product.id);
  }

  return (
    <>
      <div className="admin-page">
        <div className="admin-header-card">
          <div className="admin-header-card__row">
            <div>
              <p className="admin-eyebrow">Kelola Produk</p>
              <h1 className="admin-title">Produk</h1>
              <p className="admin-description">
                Kelola stok, harga, dan item snack atau minuman yang dipakai saat
                transaksi berlangsung.
              </p>
            </div>

            <div className="admin-header-card__action">
              <button
                type="button"
                onClick={handleOpenCreate}
                className="admin-button admin-button--primary"
              >
                <Plus className="h-4 w-4" />
                Tambah Produk
              </button>
            </div>
          </div>
        </div>

        <div className="admin-filter-bar lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <label className="relative block">
            <span className="mb-2 block text-sm font-medium text-[var(--admin-text)]">
              Cari produk
            </span>
            <Search className="pointer-events-none absolute left-4 top-[calc(50%+0.8rem)] h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari produk berdasarkan nama"
              className="admin-input pl-11"
            />
          </label>
        </div>

        <div className="admin-section">
          {productsQuery.isLoading ? (
            <div className="admin-state-surface rounded-[1rem] p-5">
              <SectionSkeleton variant="list" count={4} />
            </div>
          ) : productsQuery.isError ? (
            <div>
              <ErrorState
                title="Produk gagal dimuat"
                description="Daftar produk admin belum bisa diambil. Coba muat ulang halaman ini."
                onRetry={() => productsQuery.refetch()}
                className="admin-state-surface bg-[rgba(255,138,138,0.12)]"
                titleClassName="text-[var(--admin-danger)]"
                descriptionClassName="text-[var(--admin-text-muted)]"
                retryClassName="bg-[var(--admin-purple)] hover:bg-[var(--admin-purple-hover)]"
              />
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="Produk tidak ditemukan"
              description="Coba kata kunci lain atau tambahkan produk baru ke daftar."
              className="admin-state-surface"
              titleClassName="text-[var(--admin-text)]"
              descriptionClassName="text-[var(--admin-text-muted)]"
            />
          ) : (
            <div className="admin-table-wrap">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="admin-table-row">
                        <td>
                          <div>
                            <p className="font-semibold text-[var(--admin-text)]">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
                              {product.code}
                            </p>
                          </div>
                        </td>
                        <td className="admin-number">{formatRupiah(product.price)}</td>
                        <td className="admin-number text-[var(--admin-text)]">
                          {product.stock}
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${
                              product.isActive
                                ? "admin-badge--success"
                                : "admin-badge--muted"
                            }`}
                          >
                            {product.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(product)}
                              disabled={
                                createMutation.isPending ||
                                updateMutation.isPending ||
                                deleteMutation.isPending
                              }
                              className="admin-button admin-button--secondary min-h-0 px-3 py-2 text-xs"
                            >
                              <PencilLine className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product)}
                              disabled={
                                createMutation.isPending ||
                                updateMutation.isPending ||
                                deleteMutation.isPending
                              }
                              className="admin-button admin-button--danger min-h-0 px-3 py-2 text-xs"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {editingProduct !== undefined ? (
        <ProductFormModal
          product={editingProduct}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => setEditingProduct(undefined)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </>
  );
}

export default AdminProductsPage;
