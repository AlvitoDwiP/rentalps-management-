import { MonitorPlay, Wrench, Zap } from "lucide-react";

import useLiveDuration from "../hooks/useLiveDuration.js";
import { formatDuration } from "../lib/format.js";

function getStatusStyles(status) {
  if (status === "AVAILABLE") {
    return {
      chip: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      card: "border-emerald-200/80 bg-white hover:border-emerald-400 hover:shadow-emerald-500/20",
      button: "bg-emerald-600 text-white hover:bg-emerald-700",
      icon: Zap,
    };
  }

  if (status === "IN_USE") {
    return {
      chip: "bg-amber-100 text-amber-700 ring-amber-200",
      card: "border-amber-200/80 bg-amber-50/70",
      button: "bg-slate-200 text-slate-500",
      icon: MonitorPlay,
    };
  }

  return {
    chip: "bg-rose-100 text-rose-700 ring-rose-200",
    card: "border-rose-200/80 bg-rose-50/70",
    button: "bg-slate-200 text-slate-500",
    icon: Wrench,
  };
}

function ConsoleCard({ consoleUnit, activeTransaction, onSelectConsole }) {
  const statusStyles = getStatusStyles(consoleUnit.status);
  const StatusIcon = statusStyles.icon;
  const canStart = consoleUnit.status === "AVAILABLE";
  const liveDuration = useLiveDuration(activeTransaction?.startTime);

  return (
    <article
      className={`rounded-[1.5rem] border p-4 transition ${statusStyles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {consoleUnit.consoleType}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            {consoleUnit.code}
          </h3>
        </div>

        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <StatusIcon className="h-5 w-5" />
        </div>
      </div>

      {consoleUnit.status === "IN_USE" && activeTransaction ? (
        <div className="mt-4 rounded-[1.25rem] border border-white/50 bg-white/60 p-3 text-sm">
          {activeTransaction.pricingType === "OPEN" ? (
            <>
              <p className="text-slate-500">Durasi live</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {liveDuration.formatted}
              </p>
            </>
          ) : (
            <>
              <p className="text-slate-500">
                Paket {formatDuration(activeTransaction.packageDurationSnapshot)}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                Berjalan {liveDuration.formatted}
              </p>
            </>
          )}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles.chip}`}
        >
          {consoleUnit.status}
        </span>

        <button
          type="button"
          disabled={!canStart}
          onClick={() => onSelectConsole(consoleUnit)}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${statusStyles.button} ${
            !canStart ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {canStart ? "Mulai Transaksi" : "Tidak Tersedia"}
        </button>
      </div>
    </article>
  );
}

export default ConsoleCard;
