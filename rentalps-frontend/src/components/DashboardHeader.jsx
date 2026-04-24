import { LogOut, RadioTower, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

import useAuthStore from "../store/authStore.js";

function DashboardHeader() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  function handleLogout() {
    clearAuth();
    toast.success("Sesi berhasil diakhiri.");
  }

  return (
    <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-orange-600">
            <RadioTower className="h-3.5 w-3.5" />
            Kasir Real-Time
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
              Dashboard Rental PlayStation
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Pantau status console, buka transaksi baru, dan selesaikan billing
              secepat mungkin saat outlet sedang sibuk.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-950 px-4 py-4 text-white sm:flex-row sm:items-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <UserCircle2 className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{user?.name || "Cashier"}</p>
            <p className="text-sm text-slate-300">
              {user?.role || "-"} · {user?.username || user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
