import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Settings2, Tv } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import EmptyState from "../../components/EmptyState.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import SectionSkeleton from "../../components/SectionSkeleton.jsx";
import {
  getApiErrorMessage,
  getConsoles,
  updateAdminConsoleMaintenanceRequest,
} from "../../lib/api.js";

const TYPE_OPTIONS = ["ALL", "PS3", "PS4", "PS5"];
const STATUS_OPTIONS = ["ALL", "AVAILABLE", "IN_USE", "MAINTENANCE"];

function formatUpdatedAt(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClasses(status) {
  const statusClassMap = {
    AVAILABLE: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    IN_USE: "border-sky-500/20 bg-sky-500/10 text-sky-200",
    MAINTENANCE: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  };

  return statusClassMap[status] || "border-white/10 bg-white/[0.06] text-slate-200";
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
        active
          ? "border-violet-400/30 bg-violet-500 text-white shadow-[0_18px_40px_-26px_rgba(139,92,246,0.85)]"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]"
      }`}
    >
      {children}
    </button>
  );
}

function AdminConsolesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pendingConsoleId, setPendingConsoleId] = useState(null);

  const consolesQuery = useQuery({
    queryKey: ["consoles"],
    queryFn: getConsoles,
    refetchInterval: 30000,
  });

  const updateConsoleMutation = useMutation({
    mutationFn: updateAdminConsoleMaintenanceRequest,
    onMutate: ({ id }) => {
      setPendingConsoleId(id);
    },
    onSuccess: (updatedConsole) => {
      const actionLabel =
        updatedConsole.status === "MAINTENANCE" ? "Maintenance diaktifkan" : "Console tersedia kembali";

      toast.success(`${updatedConsole.code} berhasil diperbarui. ${actionLabel}.`);
      queryClient.invalidateQueries({ queryKey: ["consoles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
    onSettled: () => {
      setPendingConsoleId(null);
    },
  });

  const consoles = Array.isArray(consolesQuery.data) ? consolesQuery.data : [];
  const normalizedSearch = search.trim().toLowerCase();
  const filteredConsoles = consoles.filter((consoleUnit) => {
    const matchesSearch =
      !normalizedSearch || consoleUnit.code?.toLowerCase().includes(normalizedSearch);
    const matchesType = typeFilter === "ALL" || consoleUnit.consoleType === typeFilter;
    const matchesStatus = statusFilter === "ALL" || consoleUnit.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const summary = {
    total: consoles.length,
    available: consoles.filter((item) => item.status === "AVAILABLE").length,
    inUse: consoles.filter((item) => item.status === "IN_USE").length,
    maintenance: consoles.filter((item) => item.status === "MAINTENANCE").length,
  };

  function handleMaintenanceToggle(consoleUnit) {
    if (updateConsoleMutation.isPending || consoleUnit.status === "IN_USE") {
      return;
    }

    const nextStatus =
      consoleUnit.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";

    updateConsoleMutation.mutate({
      id: consoleUnit.id,
      status: nextStatus,
    });
  }

  if (consolesQuery.isLoading) {
    return (
      <div className="space-y-5">
        <SectionSkeleton className="h-44 rounded-[1.75rem] border border-violet-500/16 bg-white/[0.04]" />
        <SectionSkeleton className="h-28 rounded-[1.75rem] border border-violet-500/16 bg-white/[0.04]" />
        <SectionSkeleton className="h-[26rem] rounded-[1.75rem] border border-violet-500/16 bg-white/[0.04]" />
      </div>
    );
  }

  if (consolesQuery.isError) {
    return (
      <ErrorState
        title="Data console belum bisa dimuat"
        description="Daftar console admin gagal diambil. Coba muat ulang halaman ini."
        onRetry={() => consolesQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-violet-500/18 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_30%),rgba(15,23,42,0.94)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
              Console
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
              Console Control
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Kelola status console dan maintenance tanpa menyentuh flow dashboard kasir.
            </p>
          </div>
          <div className="grid min-w-[220px] gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-500/18 bg-emerald-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-200/80">Available</p>
              <p className="font-display-number mt-2 text-2xl font-semibold text-emerald-100">
                {summary.available}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-500/18 bg-sky-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-sky-200/80">In Use</p>
              <p className="font-display-number mt-2 text-2xl font-semibold text-sky-100">
                {summary.inUse}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/18 bg-amber-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-200/80">Maintenance</p>
              <p className="font-display-number mt-2 text-2xl font-semibold text-amber-100">
                {summary.maintenance}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-violet-500/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.82))] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
              Filter Console
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Temukan console lebih cepat</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
            <Settings2 className="h-4 w-4 text-violet-200" />
            <span>Total {summary.total} console</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Search code</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari PS5-03"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-300">Filter type</span>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((option) => (
                <FilterButton
                  key={option}
                  active={typeFilter === option}
                  onClick={() => setTypeFilter(option)}
                >
                  {option}
                </FilterButton>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-300">Filter status</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <FilterButton
                  key={option}
                  active={statusFilter === option}
                  onClick={() => setStatusFilter(option)}
                >
                  {option}
                </FilterButton>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-violet-500/12 bg-white/[0.04] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
              Console List
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Status Console</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/18 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">
            {filteredConsoles.length} console cocok
          </div>
        </div>

        {filteredConsoles.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="Console tidak ditemukan"
              description="Coba ubah kata kunci pencarian atau filter status dan type console."
              className="border-white/10 bg-slate-950/40"
              titleClassName="text-white"
              descriptionClassName="text-slate-400"
            />
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/8 bg-slate-950/35">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Updated At</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsoles.map((consoleUnit) => {
                    const isPending =
                      updateConsoleMutation.isPending && pendingConsoleId === consoleUnit.id;
                    const isInUse = consoleUnit.status === "IN_USE";
                    const nextStatus =
                      consoleUnit.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
                    const actionLabel =
                      consoleUnit.status === "MAINTENANCE" ? "Set Available" : "Set Maintenance";

                    return (
                      <tr
                        key={consoleUnit.id}
                        className="border-b border-white/6 text-slate-200 last:border-b-0"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/18 bg-violet-500/10 text-violet-200">
                              <Tv className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-display-number text-base font-semibold text-white">
                                {consoleUnit.code}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID {consoleUnit.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-200">
                            {consoleUnit.consoleType}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(consoleUnit.status)}`}
                          >
                            {consoleUnit.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {formatUpdatedAt(consoleUnit.updatedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handleMaintenanceToggle(consoleUnit)}
                              disabled={isInUse || updateConsoleMutation.isPending}
                              className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                                isInUse || updateConsoleMutation.isPending
                                  ? "cursor-not-allowed border border-white/10 bg-white/[0.04] text-slate-500"
                                  : nextStatus === "MAINTENANCE"
                                    ? "border border-amber-500/20 bg-amber-500/12 text-amber-100 hover:bg-amber-500/18"
                                    : "border border-emerald-500/20 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/18"
                              }`}
                            >
                              {isPending ? "Menyimpan..." : actionLabel}
                            </button>
                            {isInUse ? (
                              <p className="text-xs text-slate-500">Console sedang dipakai</p>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminConsolesPage;
