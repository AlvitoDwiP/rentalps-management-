import { LayoutGrid, Package2, ReceiptText, Tv, UserCog, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import useAuthStore from "../store/authStore.js";

const menuItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutGrid },
  { label: "Products", to: "/admin/products", icon: Package2 },
  { label: "Packages", to: "/admin/packages", icon: ReceiptText },
  { label: "Rates", to: "/admin/rates", icon: ReceiptText },
  { label: "Consoles", icon: Tv, disabled: true },
  { label: "Users", icon: Users, disabled: true },
];

function AdminLayout() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.7)] backdrop-blur">
          <div className="rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.35),transparent_35%),rgba(15,23,42,0.92)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">
              Admin Area
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Rental PS Control</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Kelola master data operasional tanpa keluar dari area admin.
            </p>
          </div>

          <div className="mt-5 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.disabled) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400"
                  >
                    <span className="inline-flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Soon
                    </span>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : "border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
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
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
          >
            Kasir Dashboard
          </NavLink>
        </aside>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.7)] backdrop-blur sm:p-6">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

export default AdminLayout;
