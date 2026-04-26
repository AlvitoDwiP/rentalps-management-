import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Tv } from "lucide-react";
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
    AVAILABLE: "admin-badge admin-badge--success",
    IN_USE: "admin-badge admin-badge--info",
    MAINTENANCE: "admin-badge admin-badge--warning",
  };

  return statusClassMap[status] || "admin-badge admin-badge--muted";
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-button min-h-0 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] ${
        active
          ? "admin-button--primary"
          : "admin-button--secondary"
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
      <div className="admin-page">
        <div className="admin-state-surface rounded-[1rem] p-5">
          <SectionSkeleton variant="grid" count={3} />
        </div>
        <div className="admin-state-surface rounded-[1rem] p-5">
          <SectionSkeleton variant="list" count={3} />
        </div>
      </div>
    );
  }

  if (consolesQuery.isError) {
    return (
      <ErrorState
        title="Data console belum bisa dimuat"
        description="Daftar console admin gagal diambil. Coba muat ulang halaman ini."
        onRetry={() => consolesQuery.refetch()}
        className="admin-state-surface bg-[rgba(255,138,138,0.12)]"
        titleClassName="text-[var(--admin-danger)]"
        descriptionClassName="text-[var(--admin-text-muted)]"
        retryClassName="bg-[var(--admin-purple)] hover:bg-[var(--admin-purple-hover)]"
      />
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header-card !py-5">
        <div className="admin-header-card__row items-center">
          <div>
            <p className="admin-eyebrow">CONSOLE</p>
            <h1 className="admin-title">Console</h1>
            <p className="admin-description mt-2">
              Kelola status console dan maintenance.
            </p>
          </div>
          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
            <div className="rounded-2xl border border-[rgba(126,217,87,0.18)] bg-[rgba(126,217,87,0.08)] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--admin-success)]">
                AVAILABLE
              </p>
              <p className="font-display-number mt-1.5 text-xl font-semibold text-[var(--admin-text)]">
                {summary.available}
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(138,180,248,0.18)] bg-[rgba(138,180,248,0.08)] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--admin-link)]">
                IN USE
              </p>
              <p className="font-display-number mt-1.5 text-xl font-semibold text-[var(--admin-text)]">
                {summary.inUse}
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(251,191,36,0.18)] bg-[rgba(251,191,36,0.08)] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--admin-amber)]">
                MAINTENANCE
              </p>
              <p className="font-display-number mt-1.5 text-xl font-semibold text-[var(--admin-text)]">
                {summary.maintenance}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-filter-bar gap-3 !py-4 !px-5 xl:grid-cols-[minmax(220px,1.2fr)_auto_auto_auto] xl:items-center">
        <label className="block min-w-0">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
            Search
          </span>
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-soft)] px-3.5 py-2.5">
            <Search className="h-4 w-4 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari console..."
              className="w-full bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-text-muted)]"
            />
          </div>
        </label>

        <div className="min-w-0">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
            Type
          </span>
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

        <div className="min-w-0">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
            Status
          </span>
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

        <div className="inline-flex items-center justify-center self-end rounded-full border border-[rgba(124,58,237,0.22)] bg-[rgba(124,58,237,0.12)] px-3 py-1.5 text-xs font-semibold text-[#ddcdff] xl:self-center">
          {filteredConsoles.length} console cocok
        </div>
      </div>

      <div className="admin-section !p-5">
        {filteredConsoles.length === 0 ? (
          <EmptyState
            title="Console tidak ditemukan"
            description="Coba ubah kata kunci pencarian atau filter status dan type console."
            className="admin-state-surface"
            titleClassName="text-[var(--admin-text)]"
            descriptionClassName="text-[var(--admin-text-muted)]"
          />
        ) : (
          <div className="admin-table-wrap mt-0">
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Updated At</th>
                    <th className="text-right">Action</th>
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
                      <tr key={consoleUnit.id} className="admin-table-row">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(124,58,237,0.14)] bg-[rgba(124,58,237,0.1)] text-[#ddcdff]">
                              <Tv className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-display-number text-sm font-semibold text-[var(--admin-text)]">
                                {consoleUnit.code}
                              </p>
                              <p className="text-[11px] text-[var(--admin-text-muted)]">
                                ID {consoleUnit.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="admin-badge admin-badge--muted">
                            {consoleUnit.consoleType}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={getStatusClasses(consoleUnit.status)}>
                            {consoleUnit.status}
                          </span>
                        </td>
                        <td className="py-3 text-sm">{formatUpdatedAt(consoleUnit.updatedAt)}</td>
                        <td className="py-3 text-right">
                          {isInUse ? (
                            <div className="inline-flex flex-col items-end gap-1">
                              <button
                                type="button"
                                disabled
                                className="admin-button admin-button--ghost min-h-0 px-3 py-2 text-xs"
                              >
                                Sedang dipakai
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMaintenanceToggle(consoleUnit)}
                              disabled={updateConsoleMutation.isPending}
                              className={`admin-button min-h-0 px-3 py-2 text-xs ${
                                updateConsoleMutation.isPending
                                  ? "admin-button--ghost"
                                  : nextStatus === "MAINTENANCE"
                                    ? "admin-button--warning"
                                    : "admin-button--success"
                              }`}
                            >
                              {isPending ? "Menyimpan..." : actionLabel}
                            </button>
                          )}
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
