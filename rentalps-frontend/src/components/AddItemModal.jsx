import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBasket, X } from "lucide-react";
import { toast } from "sonner";

import {
  addTransactionItemRequest,
  getApiErrorMessage,
  getProducts,
} from "../lib/api.js";
import { formatRupiah } from "../lib/format.js";
import EmptyState from "./EmptyState.jsx";
import ErrorState from "./ErrorState.jsx";

function AddItemModal({ transaction, onClose }) {
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState({});

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: Boolean(transaction),
    staleTime: 15000,
  });

  const addItemsMutation = useMutation({
    mutationFn: async (items) => {
      for (const item of items) {
        await addTransactionItemRequest({
          transactionId: transaction.id,
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    },
    onSuccess: async () => {
      toast.success("Item berhasil ditambahkan ke transaksi.");
      setSelectedItems({});
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["active-transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
      onClose();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  useEffect(() => {
    if (!transaction) {
      setSelectedItems({});
    }
  }, [transaction]);

  const products = productsQuery.data || [];

  const selectedEntries = useMemo(
    () =>
      products
        .map((product) => ({
          productId: product.id,
          productName: product.name,
          price: Number(product.price || 0),
          quantity: selectedItems[product.id] || 0,
        }))
        .filter((item) => item.quantity > 0),
    [products, selectedItems],
  );

  const totalQuantity = selectedEntries.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = selectedEntries.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (!transaction) {
    return null;
  }

  function increaseQuantity(product) {
    if (addItemsMutation.isPending || Number(product.stock) <= 0) {
      return;
    }

    setSelectedItems((current) => {
      const currentQty = current[product.id] || 0;

      if (currentQty >= Number(product.stock)) {
        return current;
      }

      return {
        ...current,
        [product.id]: currentQty + 1,
      };
    });
  }

  function decreaseQuantity(productId) {
    if (addItemsMutation.isPending) {
      return;
    }

    setSelectedItems((current) => {
      const currentQty = current[productId] || 0;

      if (currentQty <= 1) {
        const next = { ...current };
        delete next[productId];
        return next;
      }

      return {
        ...current,
        [productId]: currentQty - 1,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (selectedEntries.length === 0 || addItemsMutation.isPending) {
      return;
    }

    await addItemsMutation.mutateAsync(
      selectedEntries.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">
              Add Item
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-white">
              {transaction.playStationUnit?.code}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              {transaction.customerName || "Walk-in Customer"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={addItemsMutation.isPending}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-100">Pilih produk</p>
                <p className="text-sm text-slate-400">
                  Klik kartu untuk tambah cepat. Tombol minus untuk koreksi quantity.
                </p>
              </div>
              {productsQuery.isLoading ? (
                <span className="text-xs text-slate-400">Memuat produk...</span>
              ) : null}
            </div>

            {productsQuery.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/5"
                  />
                ))}
              </div>
            ) : productsQuery.isError ? (
              <ErrorState
                title="Produk gagal dimuat"
                description="Daftar produk belum bisa diambil saat ini. Coba muat ulang lagi."
                retryLabel="Retry Produk"
                onRetry={() => productsQuery.refetch()}
                className="border-white/10 bg-rose-500/10"
              />
            ) : products.length === 0 ? (
              <EmptyState
                title="Belum ada produk aktif"
                description="Tambahkan produk dulu dari admin panel sebelum kasir menjual item."
                className="border-white/15 bg-white/[0.03]"
                titleClassName="text-white"
                descriptionClassName="text-slate-400"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {products.map((product) => {
                  const stock = Number(product.stock || 0);
                  const quantity = selectedItems[product.id] || 0;
                  const isOutOfStock = stock <= 0;
                  const isMaxed = quantity >= stock;

                  return (
                    <div
                      key={product.id}
                      className={`rounded-[1.5rem] border p-4 transition ${
                        isOutOfStock
                          ? "border-white/10 bg-white/[0.03] opacity-60"
                          : quantity > 0
                            ? "border-orange-400/70 bg-orange-500/10"
                            : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={isOutOfStock || addItemsMutation.isPending || isMaxed}
                        onClick={() => increaseQuantity(product)}
                        className="w-full text-left disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-white">{product.name}</p>
                            <p className="mt-1 text-sm text-slate-400">
                              {formatRupiah(product.price)}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isOutOfStock
                                ? "bg-rose-500/15 text-rose-200"
                                : "bg-emerald-500/15 text-emerald-200"
                            }`}
                          >
                            Stok {stock}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <span className="text-sm text-slate-300">
                            {isOutOfStock
                              ? "Stok habis"
                              : isMaxed
                                ? "Stok maksimum dipilih"
                                : "Klik untuk tambah +1"}
                          </span>
                          <span className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                            Qty {quantity}
                          </span>
                        </div>
                      </button>

                      <div className="mt-4 flex items-center justify-end">
                        <button
                          type="button"
                          disabled={quantity === 0 || addItemsMutation.isPending}
                          onClick={() => decreaseQuantity(product.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isOutOfStock || addItemsMutation.isPending || isMaxed}
                          onClick={() => increaseQuantity(product)}
                          className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
                <ShoppingBasket className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Ringkasan item</p>
                <p className="text-xl font-semibold text-white">{totalQuantity} item</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selectedEntries.length === 0 ? (
                <EmptyState
                  title="Belum ada produk dipilih"
                  description="Klik produk di sebelah kiri untuk menambahkan item ke transaksi."
                  className="border-white/10 bg-slate-950/60"
                  titleClassName="text-white"
                  descriptionClassName="text-slate-400"
                />
              ) : (
                selectedEntries.map((item) => (
                  <div
                    key={item.productId}
                    className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{item.productName}</p>
                      <span className="text-sm text-slate-300">x{item.quantity}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-400">
                      <span>{formatRupiah(item.price)}</span>
                      <span className="font-medium text-slate-200">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                <span>Total sementara</span>
                <span className="text-lg font-semibold text-white">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                type="submit"
                disabled={
                  addItemsMutation.isPending ||
                  selectedEntries.length === 0 ||
                  productsQuery.isLoading ||
                  productsQuery.isError
                }
                className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addItemsMutation.isPending ? "Menyimpan item..." : "Tambah ke Transaksi"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={addItemsMutation.isPending}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemModal;
