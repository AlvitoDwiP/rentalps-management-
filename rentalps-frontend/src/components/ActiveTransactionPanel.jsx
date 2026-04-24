import { Coffee, ReceiptText } from "lucide-react";
import { formatRupiah } from "../lib/format.js";

function ActiveTransactionPanel({
  transactions,
  isLoading,
  onFinish,
  onAddItem,
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-slate-950">Transaksi Aktif</h2>
        <p className="mt-1 text-sm text-slate-500">
          Kasir bisa langsung cek transaksi berjalan dan menutup billing dari panel ini.
        </p>
      </div>

      <div className="max-h-[calc(100vh-17rem)] overflow-y-auto p-5 sm:p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <p className="text-lg font-semibold text-slate-800">Belum ada transaksi aktif</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pilih console yang available di grid untuk mulai billing baru.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
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

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                    onClick={() => onFinish(transaction)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    <ReceiptText className="h-4 w-4" />
                    Finish
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ActiveTransactionPanel;
