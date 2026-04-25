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
import { theme } from "../lib/theme.js";
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
    <div
      data-modal-root="true"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
    >
      <div className="dashboard-panel w-full max-w-4xl overflow-hidden">
        <div
          className="flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-6"
          style={{ borderColor: theme.colors.border }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Add Item
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
              {transaction.playStationUnit?.code}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {transaction.customerName || "Walk-in Customer"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={addItemsMutation.isPending}
            className="app-button app-button--ghost min-h-11 w-11 p-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1.45fr_0.75fr]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Pilih produk</p>
                <p className="text-sm text-[var(--color-muted)]">
                  Klik kartu untuk tambah cepat. Tombol minus untuk koreksi quantity.
                </p>
              </div>
              {productsQuery.isLoading ? (
                <span className="text-xs text-[var(--color-muted)]">Memuat produk...</span>
              ) : null}
            </div>

            {productsQuery.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 animate-pulse rounded-[14px] border"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceSoft,
                    }}
                  />
                ))}
              </div>
            ) : productsQuery.isError ? (
              <ErrorState
                title="Produk gagal dimuat"
                description="Daftar produk belum bisa diambil saat ini. Coba muat ulang lagi."
                retryLabel="Retry Produk"
                onRetry={() => productsQuery.refetch()}
                className="border-[var(--color-maintenance)] bg-[var(--color-maintenance-soft)]"
              />
            ) : products.length === 0 ? (
              <EmptyState
                title="Belum ada produk aktif"
                description="Tambahkan produk dulu dari admin panel sebelum kasir menjual item."
                className="border-[var(--color-border)] bg-[var(--color-surface-soft)]"
                titleClassName="text-[var(--color-text)]"
                descriptionClassName="text-[var(--color-muted)]"
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
                      className="rounded-[14px] border p-4 transition"
                      style={{
                        borderColor:
                          quantity > 0 ? theme.colors.available : theme.colors.border,
                        backgroundColor:
                          quantity > 0 ? theme.colors.availableSoft : theme.colors.surfaceSoft,
                        opacity: isOutOfStock ? 0.6 : 1,
                      }}
                    >
                      <button
                        type="button"
                        disabled={isOutOfStock || addItemsMutation.isPending || isMaxed}
                        onClick={() => increaseQuantity(product)}
                        className="w-full text-left disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-[var(--color-text)]">
                              {product.name}
                            </p>
                            <p className="mt-1 font-display-number text-sm text-[var(--color-muted)]">
                              {formatRupiah(product.price)}
                            </p>
                          </div>

                          <span className="mode-badge mode-badge--open">Stok {stock}</span>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <span className="text-sm text-[var(--color-muted)]">
                            {isOutOfStock
                              ? "Stok habis"
                              : isMaxed
                                ? "Stok maksimum dipilih"
                                : "Klik untuk tambah +1"}
                          </span>
                          <span
                            className="rounded-[10px] border px-3 py-2 text-sm font-semibold"
                            style={{
                              borderColor: theme.colors.border,
                              backgroundColor: theme.colors.surface,
                              color: theme.colors.text,
                            }}
                          >
                            Qty {quantity}
                          </span>
                        </div>
                      </button>

                      <div className="mt-4 flex items-center justify-end">
                        <button
                          type="button"
                          disabled={quantity === 0 || addItemsMutation.isPending}
                          onClick={() => decreaseQuantity(product.id)}
                          className="app-button app-button--ghost min-h-10 w-10 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isOutOfStock || addItemsMutation.isPending || isMaxed}
                          onClick={() => increaseQuantity(product)}
                          className={`ml-2 app-button min-h-10 w-10 p-0 ${
                            isOutOfStock || addItemsMutation.isPending || isMaxed
                              ? "app-button--disabled"
                              : "app-button--primary"
                          }`}
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

          <div
            className="flex flex-col rounded-[16px] border p-5"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceSoft,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                }}
              >
                <ShoppingBasket className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Ringkasan item</p>
                <p className="text-xl font-semibold text-[var(--color-text)]">
                  {totalQuantity} item
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selectedEntries.length === 0 ? (
                <EmptyState
                  title="Belum ada produk dipilih"
                  description="Klik produk di sebelah kiri untuk menambahkan item ke transaksi."
                  className="border-[var(--color-border)] bg-[var(--color-surface)]"
                  titleClassName="text-[var(--color-text)]"
                  descriptionClassName="text-[var(--color-muted)]"
                />
              ) : (
                selectedEntries.map((item) => (
                  <div
                    key={item.productId}
                    className="rounded-[12px] border px-4 py-4"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-[var(--color-text)]">{item.productName}</p>
                      <span className="text-sm text-[var(--color-muted)]">x{item.quantity}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
                      <span className="font-display-number">{formatRupiah(item.price)}</span>
                      <span className="font-display-number font-medium text-[var(--color-text)]">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              className="mt-5 border-t pt-4"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
                <span>Total sementara</span>
                <span className="font-display-number text-lg font-semibold text-[var(--color-text)]">
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
                className={`app-button ${
                  addItemsMutation.isPending ||
                  selectedEntries.length === 0 ||
                  productsQuery.isLoading ||
                  productsQuery.isError
                    ? "app-button--disabled"
                    : "app-button--primary"
                }`}
              >
                {addItemsMutation.isPending ? "Menyimpan item..." : "Tambah ke Transaksi"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={addItemsMutation.isPending}
                className="app-button app-button--ghost"
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
