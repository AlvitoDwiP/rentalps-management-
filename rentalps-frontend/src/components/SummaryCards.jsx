import { Gamepad2, ShieldAlert, TimerReset, Tv2 } from "lucide-react";

const cards = [
  {
    key: "available",
    label: "Available",
    icon: Gamepad2,
    accent: "from-emerald-500/20 to-emerald-500/5 text-emerald-700",
  },
  {
    key: "inUse",
    label: "In Use",
    icon: TimerReset,
    accent: "from-amber-500/20 to-amber-500/5 text-amber-700",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    icon: ShieldAlert,
    accent: "from-rose-500/20 to-rose-500/5 text-rose-700",
  },
  {
    key: "total",
    label: "Total Console",
    icon: Tv2,
    accent: "from-sky-500/20 to-sky-500/5 text-sky-700",
  },
];

function SummaryCards({ summary, isLoading }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className={`rounded-[1.75rem] border border-white/70 bg-gradient-to-br ${card.accent} p-5 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.4)]`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-3 text-4xl font-semibold text-slate-950">
                  {isLoading ? "..." : summary[card.key]}
                </p>
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75">
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
