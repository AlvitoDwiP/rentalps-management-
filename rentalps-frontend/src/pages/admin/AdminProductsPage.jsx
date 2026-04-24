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
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_30%),rgba(15,23,42,0.92)] p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">
              Admin Products
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Kelola Produk</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Tambah, edit, dan nonaktifkan snack atau minuman yang dipakai kasir
              saat transaksi berlangsung.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </button>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari produk berdasarkan nama"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04]">
          {productsQuery.isLoading ? (
            <div className="p-5">
              <SectionSkeleton variant="list" count={4} />
            </div>
          ) : productsQuery.isError ? (
            <div className="p-5">
              <ErrorState
                title="Produk gagal dimuat"
                description="Daftar produk admin belum bisa diambil. Coba muat ulang halaman ini."
                onRetry={() => productsQuery.refetch()}
                className="border-white/10 bg-rose-500/10"
              />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Produk tidak ditemukan"
                description="Coba kata kunci lain atau tambahkan produk baru ke daftar."
                className="border-white/10 bg-slate-950/40"
                titleClassName="text-white"
                descriptionClassName="text-slate-400"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">Name</th>
                    <th className="px-5 py-4 font-medium">Price</th>
                    <th className="px-5 py-4 font-medium">Stock</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-white/10 text-slate-200"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {product.code}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">{formatRupiah(product.price)}</td>
                      <td className="px-5 py-4">{product.stock}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            product.isActive
                              ? "bg-emerald-500/15 text-emerald-200"
                              : "bg-slate-500/15 text-slate-300"
                          }`}
                        >
                          {product.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(product)}
                            disabled={
                              createMutation.isPending ||
                              updateMutation.isPending ||
                              deleteMutation.isPending
                            }
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
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
