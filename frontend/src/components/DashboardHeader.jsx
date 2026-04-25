import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Menu,
  ReceiptText,
  UserCircle2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { theme } from "../lib/theme.js";
import useAuthStore from "../store/authStore.js";

function NavItem({ icon: Icon, label, isActive = false, badge, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
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
    </button>
  );
}

function DashboardHeader({
  activeTransactionCount = 0,
  isTransactionPanelOpen = true,
  onDashboardClick,
  onActiveTransactionsClick,
  onHistoryClick,
  user: providedUser,
}) {
  const navigate = useNavigate();
  const storedUser = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const userMenuRef = useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const user = providedUser || storedUser;
  const displayName = user?.name || user?.username || "User";
  const displayRole = user?.role || "USER";

  useEffect(() => {
    function handlePointerDown(event) {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLogout() {
    setIsUserMenuOpen(false);
    clearAuth();
    toast.success("Sesi berhasil diakhiri.");
    navigate("/login", { replace: true });
  }

  return (
    <header className="dashboard-panel dashboard-panel--header overflow-hidden">
      <div
        className="dashboard-header-bar flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 sm:px-6"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderColor: theme.colors.border,
        }}
      >
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => toast.info("Menu belum tersedia")}
            title="Menu belum tersedia"
            className="app-button app-button--ghost h-[52px] w-[52px] shrink-0 p-0"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex shrink-0 items-center gap-4">
            <div
              className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] text-base font-extrabold tracking-[-0.04em]"
              style={{
                backgroundColor: theme.colors.inUse,
                color: theme.colors.text,
              }}
            >
              PS
            </div>

            <div>
              <p className="text-[1.8rem] font-semibold tracking-[-0.05em] text-[var(--color-text)]">
                RentalPS
              </p>
            </div>
          </div>

          <nav className="dashboard-header-nav flex flex-wrap items-center gap-2">
            <NavItem
              icon={LayoutGrid}
              label="Dashboard"
              isActive={!isTransactionPanelOpen}
              onClick={onDashboardClick}
              title="Dashboard (D)"
            />
            <NavItem
              icon={ReceiptText}
              label="Transaksi Aktif"
              badge={activeTransactionCount}
              isActive={isTransactionPanelOpen}
              onClick={onActiveTransactionsClick}
              title="Transaksi Aktif (T)"
            />
            <NavItem
              icon={ReceiptText}
              label="Riwayat"
              isActive={false}
              onClick={onHistoryClick}
              title="Riwayat"
            />
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div
            ref={userMenuRef}
            className="dashboard-user-menu"
          >
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((current) => !current)}
              className="dashboard-user-button"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
            >
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                }}
              >
                <UserCircle2 className="h-5 w-5" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate text-sm font-semibold text-[var(--color-text)]">
                  {displayName}
                </span>
                <span className="block text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  {displayRole}
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform duration-200 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isUserMenuOpen ? (
              <div
                className="dashboard-user-dropdown"
                role="menu"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <div className="dashboard-user-dropdown__identity">
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceSoft,
                      color: theme.colors.text,
                    }}
                  >
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                      {displayName}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                      {displayRole}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="dashboard-user-dropdown__logout"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="app-button app-button--ghost dashboard-header-logout gap-2"
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
