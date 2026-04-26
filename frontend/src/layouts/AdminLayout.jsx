import {
  ChartColumn,
  LayoutGrid,
  Menu,
  Package2,
  Percent,
  Shield,
  Tv,
  UserCog,
  Users,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import playstationLogo from "../assets/playstation-logo.png";
import useAuthStore from "../store/authStore.js";

const primaryMenuItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutGrid, end: true },
  { label: "Laporan", to: "/admin/reports", icon: ChartColumn },
];

const managementMenuItems = [
  { label: "Produk", to: "/admin/products", icon: Package2 },
  { label: "Paket", to: "/admin/packages", icon: Shield },
  { label: "Harga", to: "/admin/rates", icon: Percent },
  { label: "Console", to: "/admin/consoles", icon: Tv },
  { label: "User", to: "/admin/users", icon: Users },
];

function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || user?.username || "Admin";
  const userMeta = user?.username || user?.email || "admin";

  return (
    <main className="admin-shell">
      <div className="admin-shell__inner">
        <header className="admin-topbar">
          <div className="admin-topbar__brand">
            <button type="button" className="admin-topbar__menu-button" aria-label="Admin menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="admin-topbar__badge">
              <img src={playstationLogo} alt="PlayStation" className="brand-playstation-logo" />
            </div>
            <div className="admin-topbar__brand-copy">
              <p className="admin-topbar__brand-title">RentalPS</p>
              <p className="admin-topbar__brand-subtitle">Admin Panel</p>
            </div>
          </div>

          <nav className="admin-topbar__nav">
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `admin-topbar__nav-item ${isActive ? "admin-topbar__nav-item--active" : ""}`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <span className="admin-topbar__separator" />
            <span className="admin-topbar__label">Kelola</span>

            {managementMenuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `admin-topbar__nav-item ${isActive ? "admin-topbar__nav-item--active" : ""}`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <span className="admin-topbar__separator" />
            <NavLink
              to="/dashboard"
              className="admin-topbar__nav-item admin-topbar__nav-item--cashier"
            >
              <Tv className="h-4 w-4" />
              <span>Kasir</span>
            </NavLink>
          </nav>

          <div className="admin-topbar__user">
            <div className="admin-topbar__user-icon">
              <UserCog className="h-4 w-4" />
            </div>
            <div className="admin-topbar__user-copy">
              <p className="admin-topbar__user-name">{userName}</p>
              <p className="admin-topbar__user-meta">
                {user?.role || "ADMIN"} · {userMeta}
              </p>
            </div>
          </div>
        </header>

        <section className="admin-content-panel">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

export default AdminLayout;
