import { MonitorPlay, Wrench, Zap } from "lucide-react";

import { getTransactionEstimate } from "../lib/billingEstimate.js";
import { formatClockDuration, formatDuration, formatRupiah } from "../lib/format.js";
import { getStatusClass, getStatusTheme, theme } from "../lib/theme.js";

function getStatusMeta(status) {
  if (status === "AVAILABLE") {
    return { icon: Zap };
  }

  if (status === "IN_USE") {
    return { icon: MonitorPlay };
  }

  return { icon: Wrench };
}

function ConsoleCard({
  consoleUnit,
  activeTransaction,
  now,
  onSelectConsole,
  onSelectTransaction,
  isSelected = false,
}) {
  const statusMeta = getStatusMeta(consoleUnit.status);
  const statusTheme = getStatusTheme(consoleUnit.status);
  const StatusIcon = statusMeta.icon;
  const statusClass = getStatusClass(consoleUnit.status);
  const estimate = getTransactionEstimate(activeTransaction, now);
  const isAvailable = consoleUnit.status === "AVAILABLE";
  const isInUse = consoleUnit.status === "IN_USE" && activeTransaction;
  const isMaintenance = consoleUnit.status === "MAINTENANCE";
  const cardStateClass = isInUse
    ? "console-card--in-use"
    : isMaintenance
      ? "console-card--maintenance"
      : "console-card--available";

  function handleCardClick() {
    if (isAvailable) {
      onSelectConsole(consoleUnit);
      return;
    }

    if (isInUse) {
      onSelectTransaction(activeTransaction);
    }
  }

  return (
    <article
      className={`console-card ${cardStateClass} cursor-default`}
      onClick={handleCardClick}
      style={{
        cursor: isAvailable || isInUse ? "pointer" : "default",
        borderColor: isSelected && isInUse ? theme.colors.inUse : statusTheme.color,
        boxShadow: isSelected
          ? `0 0 0 1px ${theme.colors.inUse}, 0 20px 42px -24px rgba(47, 109, 246, 0.55)`
          : `0 0 0 1px ${statusTheme.soft}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[2rem] font-semibold tracking-[-0.04em] text-[var(--color-text)]">
            {consoleUnit.code}
          </h3>
        </div>

        <div
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border text-[var(--color-text)]"
          style={{
            borderColor: theme.colors.border,
            backgroundColor: statusTheme.soft,
          }}
        >
          <StatusIcon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <span className={`status-badge status-badge--${statusClass}`}>
          {consoleUnit.status}
        </span>
      </div>

      {isInUse ? (
        <div className="mt-5 flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-3">
            <span className={activeTransaction.pricingType === "PACKAGE" ? "mode-badge mode-badge--package" : "mode-badge mode-badge--open"}>
              {activeTransaction.pricingType}
            </span>
            {activeTransaction.pricingType === "PACKAGE" ? (
              <span className="text-sm text-[var(--color-muted)]">
                {formatDuration(activeTransaction.packageDurationSnapshot)}
              </span>
            ) : null}
          </div>

          <p className="font-display-number console-timer console-timer--active mt-5 font-semibold text-[var(--color-text)]">
            {formatClockDuration(estimate.elapsedSeconds)}
          </p>
          <p className="mt-4 truncate text-[1.02rem] text-[var(--color-text)]">
            {activeTransaction.customerName || "Walk-in Customer"}
          </p>
          <p className="font-display-number mt-auto pt-4 text-sm text-[var(--color-muted)]">
            Est. {formatRupiah(estimate.estimatedGrandTotal)}
          </p>
        </div>
      ) : null}

      {isAvailable ? (
        <div className="mt-auto pt-6">
          <p className="text-sm text-[var(--color-muted)]">Klik untuk mulai transaksi</p>
        </div>
      ) : null}

      {isMaintenance ? (
        <div className="mt-5 flex-1">
          <div
            className="rounded-[10px] border p-3 text-sm text-[var(--color-muted)]"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            }}
          >
            {consoleUnit.notes || "Console sedang maintenance."}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default ConsoleCard;
