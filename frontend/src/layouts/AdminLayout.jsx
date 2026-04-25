import {
  LayoutGrid,
  Package2,
  Percent,
  Shield,
  Tv,
  UserCog,
  Users,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import useAuthStore from "../store/authStore.js";

const menuItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutGrid },
  { label: "Produk", to: "/admin/products", icon: Package2 },
  { label: "Paket", to: "/admin/packages", icon: Shield },
  { label: "Harga", to: "/admin/rates", icon: Percent },
  { label: "Console", to: "/admin/consoles", icon: Tv },
  { label: "Users", to: "/admin/users", icon: Users },
];

function AdminLayout() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_22%),linear-gradient(180deg,#09090f_0%,#0f172a_100%)] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1600px] gap-5 lg:grid-cols-[292px_1fr]">
        <aside className="rounded-[2rem] border border-violet-500/12 bg-white/[0.04] p-5 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.82)] backdrop-blur">
          <div className="rounded-[1.75rem] border border-violet-400/12 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.35),transparent_35%),rgba(15,23,42,0.94)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
              Admin Area
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Rental PS Control</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Monitor operasional dan kelola master data dari panel admin terpadu.
            </p>
          </div>

          <div className="mt-5 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-violet-500 text-white shadow-[0_18px_42px_-26px_rgba(139,92,246,0.75)]"
                        : "border border-violet-500/12 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-violet-500/12 bg-white/[0.03] p-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
              <UserCog className="h-5 w-5" />
            </div>
            <p className="mt-3 text-base font-semibold text-white">
              {user?.name || "Admin"}
            </p>
            <p className="text-sm text-slate-400">
              {user?.role || "ADMIN"} · {user?.username || user?.email}
            </p>
          </div>

          <NavLink
            to="/dashboard"
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-violet-500/12 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
          >
            Kasir Dashboard
          </NavLink>
        </aside>

        <section className="rounded-[2rem] border border-violet-500/12 bg-white/[0.04] p-5 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.82)] backdrop-blur sm:p-6">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

export default AdminLayout;
