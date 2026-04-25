import { useMemo } from "react";

import useNow from "../hooks/useNow.js";
import { theme } from "../lib/theme.js";
import ConsoleCard from "./ConsoleCard.jsx";
import EmptyState from "./EmptyState.jsx";
import ErrorState from "./ErrorState.jsx";
import SectionSkeleton from "./SectionSkeleton.jsx";

const CONSOLE_GROUP_ORDER = ["PS3", "PS4", "PS5"];

const CONSOLE_GROUP_LABEL = {
  PS3: "PLAYSTATION 3",
  PS4: "PLAYSTATION 4",
  PS5: "PLAYSTATION 5",
};

function ConsoleGrid({
  consoles,
  activeTransactions,
  isLoading,
  isError,
  onRetry,
  onSelectConsole,
  onSelectTransaction,
  selectedTransactionId,
}) {
  const now = useNow(1000);
  const transactionByConsoleId = new Map(
    (activeTransactions || []).map((transaction) => [
      transaction.playStationUnit?.id || transaction.playStationUnitId,
      transaction,
    ]),
  );

  const groupedConsoles = useMemo(() => {
    const groups = new Map(CONSOLE_GROUP_ORDER.map((type) => [type, []]));

    consoles.forEach((consoleUnit) => {
      if (!groups.has(consoleUnit.consoleType)) {
        groups.set(consoleUnit.consoleType, []);
      }

      groups.get(consoleUnit.consoleType).push(consoleUnit);
    });

    return Array.from(groups.entries())
      .map(([consoleType, items]) => ({
        consoleType,
        label: CONSOLE_GROUP_LABEL[consoleType] || consoleType,
        items: [...items].sort((left, right) => left.code.localeCompare(right.code)),
      }))
      .filter((group) => group.items.length > 0);
  }, [consoles]);

  return (
    <section className="dashboard-panel overflow-hidden">
      <div
        className="border-b px-5 py-4 sm:px-6"
        style={{ borderColor: theme.colors.border }}
      >
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">Console</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Klik console yang available untuk mulai transaksi baru.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {isLoading ? (
          <SectionSkeleton variant="grid" count={9} />
        ) : isError ? (
          <ErrorState
            title="Console gagal dimuat"
            description="Dashboard belum bisa mengambil data console saat ini. Coba muat ulang panel ini."
            onRetry={onRetry}
            className="border-[var(--color-maintenance)] bg-[var(--color-maintenance-soft)]"
          />
        ) : groupedConsoles.length === 0 ? (
          <EmptyState
            title="Belum ada console"
            description="Tambahkan unit console dulu agar kasir bisa mulai transaksi."
            className="border-[var(--color-border)] bg-[var(--color-surface-soft)]"
            titleClassName="text-[var(--color-text)]"
            descriptionClassName="text-[var(--color-muted)]"
          />
        ) : (
          <div className="space-y-7">
            {groupedConsoles.map((group) => (
              <section key={group.consoleType}>
                <div className="mb-4 flex items-center gap-4">
                  <h3 className="text-[1.05rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                    {group.label}
                  </h3>
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: theme.colors.border }}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {group.items.map((consoleUnit) => (
                    <ConsoleCard
                      key={consoleUnit.id}
                      consoleUnit={consoleUnit}
                      activeTransaction={transactionByConsoleId.get(consoleUnit.id)}
                      now={now}
                      onSelectConsole={onSelectConsole}
                      onSelectTransaction={onSelectTransaction}
                      isSelected={
                        selectedTransactionId ===
                        transactionByConsoleId.get(consoleUnit.id)?.id
                      }
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ConsoleGrid;
