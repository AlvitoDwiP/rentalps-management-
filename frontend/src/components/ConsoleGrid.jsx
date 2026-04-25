import { useMemo, useState } from "react";

import ConsoleCard from "./ConsoleCard.jsx";
import EmptyState from "./EmptyState.jsx";
import ErrorState from "./ErrorState.jsx";
import SectionSkeleton from "./SectionSkeleton.jsx";

const STATUS_FILTERS = ["ALL", "AVAILABLE", "IN_USE", "MAINTENANCE"];
const TYPE_FILTERS = ["ALL", "PS3", "PS4", "PS5"];

function ConsoleGrid({
  consoles,
  activeTransactions,
  isLoading,
  isError,
  onRetry,
  onSelectConsole,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const transactionByConsoleId = new Map(
    (activeTransactions || []).map((transaction) => [
      transaction.playStationUnit?.id || transaction.playStationUnitId,
      transaction,
    ]),
  );

  const filteredConsoles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return consoles.filter((consoleUnit) => {
      const matchesSearch = !normalizedSearch
        ? true
        : consoleUnit.code.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "ALL" ? true : consoleUnit.status === statusFilter;
      const matchesType =
        typeFilter === "ALL" ? true : consoleUnit.consoleType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [consoles, search, statusFilter, typeFilter]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-slate-950">Console Grid</h2>
        <p className="mt-1 text-sm text-slate-500">
          Klik console yang available untuk mulai transaksi baru.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-5 space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Search Console
              </span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari code, contoh PS5-01"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </label>

            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Status
              </span>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStatusFilter(item)}
                    className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                      statusFilter === item
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Type
              </span>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTypeFilter(item)}
                    className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                      typeFilter === item
                        ? "bg-orange-500 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <SectionSkeleton variant="grid" count={6} />
        ) : isError ? (
          <ErrorState
            title="Console gagal dimuat"
            description="Dashboard belum bisa mengambil data console saat ini. Coba muat ulang panel ini."
            onRetry={onRetry}
          />
        ) : filteredConsoles.length === 0 ? (
          <EmptyState
            title="Tidak ada console yang cocok"
            description="Coba ubah kata kunci pencarian atau reset filter status dan type."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredConsoles.map((consoleUnit) => (
              <ConsoleCard
                key={consoleUnit.id}
                consoleUnit={consoleUnit}
                activeTransaction={transactionByConsoleId.get(consoleUnit.id)}
                onSelectConsole={onSelectConsole}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ConsoleGrid;
