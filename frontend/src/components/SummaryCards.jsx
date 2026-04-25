import { Activity, Gamepad2, ShieldAlert, TimerReset, Wallet } from "lucide-react";

import { formatRupiah } from "../lib/format.js";
import { theme } from "../lib/theme.js";

const cards = [
  {
    key: "available",
    label: "Available",
    icon: Gamepad2,
    color: theme.colors.available,
    soft: theme.colors.availableSoft,
    formatter: (value) => value,
  },
  {
    key: "inUse",
    label: "In Use",
    icon: TimerReset,
    color: theme.colors.inUse,
    soft: theme.colors.inUseSoft,
    formatter: (value) => value,
  },
  {
    key: "maintenance",
    label: "Maintenance",
    icon: ShieldAlert,
    color: theme.colors.maintenance,
    soft: theme.colors.maintenanceSoft,
    formatter: (value) => value,
  },
  {
    key: "revenueToday",
    label: "Pendapatan Hari Ini",
    icon: Wallet,
    color: theme.colors.text,
    soft: "rgba(255,255,255,0.04)",
    formatter: (value) => formatRupiah(value),
  },
  {
    key: "transactions",
    label: "Transaksi",
    icon: Activity,
    color: theme.colors.text,
    soft: "rgba(255,255,255,0.04)",
    formatter: (value) => value,
  },
];

function SummaryCards({ summary, isLoading, loadingKeys = [] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isCardLoading = isLoading || loadingKeys.includes(card.key);

        return (
          <article
            key={card.key}
            className="dashboard-panel min-h-[112px] px-4 py-4 sm:px-5"
            style={{
              background:
                card.key === "revenueToday" || card.key === "transactions"
                  ? "var(--color-surface)"
                  : `linear-gradient(180deg, ${card.soft} 0%, var(--color-surface) 88%)`,
            }}
          >
            <div className="flex h-full items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-3 w-3 rounded-full"
                    style={{ backgroundColor: card.color }}
                  />
                  <p className="text-sm text-[var(--color-muted)]">{card.label}</p>
                </div>
                <p
                  className="font-display-number mt-3 text-[2rem] font-semibold leading-none"
                  style={{ color: card.color }}
                >
                  {isCardLoading ? "..." : card.formatter(summary[card.key])}
                </p>
              </div>

              <div
                className="inline-flex h-12 w-12 items-center justify-center rounded-[10px] border"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: card.soft,
                  color: card.color,
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default SummaryCards;
