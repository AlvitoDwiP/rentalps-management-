import { LayoutGrid, LogOut, Menu, ReceiptText, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { theme } from "../lib/theme.js";
import useAuthStore from "../store/authStore.js";

function NavItem({ icon: Icon, label, isActive = false, badge }) {
  return (
    <div
      className="header-nav-item inline-flex items-center gap-2 rounded-[12px] border px-4 py-3 text-sm font-semibold"
      style={{
        borderColor: isActive ? theme.colors.border : "transparent",
        backgroundColor: isActive ? theme.colors.surface : "transparent",
        color: isActive ? theme.colors.text : theme.colors.muted,
      }}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {badge !== undefined ? (
        <span
          className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs"
          style={{
            backgroundColor: theme.colors.inUse,
            color: theme.colors.text,
          }}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function DashboardHeader({ activeTransactionCount = 0 }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  function handleLogout() {
    clearAuth();
    toast.success("Sesi berhasil diakhiri.");
    navigate("/login", { replace: true });
  }

  return (
    <header className="dashboard-panel dashboard-panel--header overflow-hidden">
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 sm:px-6"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderColor: theme.colors.border,
        }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="app-button app-button--ghost min-h-14 w-14 p-0"
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] text-lg font-extrabold tracking-[-0.04em]"
              style={{
                backgroundColor: theme.colors.inUse,
                color: theme.colors.text,
              }}
            >
              PS
            </div>

            <div>
              <p className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--color-text)]">
                RentalPS
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <NavItem icon={LayoutGrid} label="Dashboard" isActive />
            <NavItem
              icon={ReceiptText}
              label="Transaksi Aktif"
              badge={activeTransactionCount}
            />
            <NavItem icon={ReceiptText} label="Riwayat" />
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center gap-3 rounded-[14px] border px-4 py-3"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceSoft,
            }}
          >
            <div
              className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              }}
            >
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                {user?.name || "Cashier"}
              </p>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                {user?.role || "CASHIER"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="app-button app-button--ghost gap-2"
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
