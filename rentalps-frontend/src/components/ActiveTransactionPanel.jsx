import { useMemo, useState } from "react";
import { ArrowRightLeft, Coffee, ReceiptText } from "lucide-react";
import useLiveDuration from "../hooks/useLiveDuration.js";
import { formatDuration, formatRupiah } from "../lib/format.js";
import EmptyState from "./EmptyState.jsx";
import ErrorState from "./ErrorState.jsx";
import SectionSkeleton from "./SectionSkeleton.jsx";

function TransactionCard({ transaction, onAddItem, onMoveConsole, onFinish }) {
  const liveDuration = useLiveDuration(transaction.startTime);

  return (
    <article
      key={transaction.id}
      className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {transaction.pricingType}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            {transaction.playStationUnit?.code}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {transaction.customerName || "Walk-in Customer"}
          </p>
        </div>

        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          ACTIVE
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>Mulai</span>
          <span className="font-medium text-slate-900">
            {new Date(transaction.startTime).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Durasi</span>
          <span className="font-semibold text-slate-950">
            {liveDuration.formatted}
          </span>
        </div>
        {transaction.pricingType === "PACKAGE" ? (
          <div className="flex items-center justify-between gap-3">
            <span>Paket</span>
            <span className="font-medium text-slate-900">
              {formatDuration(transaction.packageDurationSnapshot)}
            </span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <span>Produk</span>
          <span className="font-medium text-slate-900">
            {formatRupiah(transaction.productTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Total berjalan</span>
          <span className="font-semibold text-slate-950">
            {formatRupiah(transaction.grandTotal)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onAddItem(transaction)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
        >
          <Coffee className="h-4 w-4" />
          Add Item
        </button>
        <button
          type="button"
          onClick={() => onMoveConsole(transaction)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
        >
          <ArrowRightLeft className="h-4 w-4" />
          Move Console
        </button>
        <button
          type="button"
          onClick={() => onFinish(transaction)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          <ReceiptText className="h-4 w-4" />
          Review Finish
        </button>
      </div>
    </article>
  );
}

function ActiveTransactionPanel({
  transactions,
  isLoading,
  isError,
  onRetry,
  onFinish,
  onAddItem,
  onMoveConsole,
}) {
  const [search, setSearch] = useState("");

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return transactions;
    }

    return transactions.filter((transaction) => {
      const haystack = [
        transaction.playStationUnit?.code,
        transaction.customerName,
        transaction.pricingType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [transactions, search]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-slate-950">Transaksi Aktif</h2>
        <p className="mt-1 text-sm text-slate-500">
          Kasir bisa langsung cek transaksi berjalan dan menutup billing dari panel ini.
        </p>
      </div>

      <div className="max-h-[calc(100vh-17rem)] overflow-y-auto p-5 sm:p-6">
        <div className="mb-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Search Active Transaction
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari console, customer, atau OPEN/PACKAGE"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </label>
        </div>

        {isLoading ? (
          <SectionSkeleton variant="list" count={4} />
        ) : isError ? (
          <ErrorState
            title="Transaksi aktif gagal dimuat"
            description="Panel transaksi belum bisa mengambil data terbaru. Coba muat ulang panel ini."
            onRetry={onRetry}
          />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Belum ada transaksi aktif"
            description="Pilih console yang available di grid untuk mulai billing baru."
          />
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi yang cocok"
            description="Coba cari berdasarkan code console, nama customer, atau mode OPEN/PACKAGE."
          />
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onAddItem={onAddItem}
                onMoveConsole={onMoveConsole}
                onFinish={onFinish}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ActiveTransactionPanel;
