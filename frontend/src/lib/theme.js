export const theme = {
  colors: {
    bg: "#111210",
    surface: "#242420",
    surfaceSoft: "#2E2E2A",
    surfaceElevated: "#34342F",
    border: "#3A3A35",

    text: "#F5F3E8",
    muted: "#B8B5AA",

    available: "#22C55E",
    inUse: "#2F6DF6",
    maintenance: "#D97706",

    availableSoft: "#174B1E",
    inUseSoft: "#1F3F66",
    maintenanceSoft: "#4A2A0A",

    buttonPrimary: "#2F6DF6",
    buttonPrimaryHover: "#2559CA",
    buttonDisabled: "#4A4A45",
    buttonDisabledText: "#918E84",
  },
  radius: {
    card: "12px",
    button: "10px",
    badge: "999px",
  },
  spacing: {
    section: "24px",
    cardGap: "16px",
    cardPadding: "16px",
  },
  shadows: {
    card: "0 16px 40px -28px rgba(0, 0, 0, 0.55)",
  },
};

const statusThemeMap = {
  AVAILABLE: {
    color: theme.colors.available,
    soft: theme.colors.availableSoft,
    className: "available",
  },
  IN_USE: {
    color: theme.colors.inUse,
    soft: theme.colors.inUseSoft,
    className: "in-use",
  },
  MAINTENANCE: {
    color: theme.colors.maintenance,
    soft: theme.colors.maintenanceSoft,
    className: "maintenance",
  },
};

export function getStatusTheme(status) {
  return statusThemeMap[status] || statusThemeMap.MAINTENANCE;
}

export function getStatusClass(status) {
  return getStatusTheme(status).className;
}

export function applyThemeVariables() {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  root.style.setProperty("--color-bg", theme.colors.bg);
  root.style.setProperty("--color-surface", theme.colors.surface);
  root.style.setProperty("--color-surface-soft", theme.colors.surfaceSoft);
  root.style.setProperty("--color-surface-elevated", theme.colors.surfaceElevated);
  root.style.setProperty("--color-border", theme.colors.border);
  root.style.setProperty("--color-text", theme.colors.text);
  root.style.setProperty("--color-muted", theme.colors.muted);
  root.style.setProperty("--color-available", theme.colors.available);
  root.style.setProperty("--color-in-use", theme.colors.inUse);
  root.style.setProperty("--color-maintenance", theme.colors.maintenance);
  root.style.setProperty("--color-available-soft", theme.colors.availableSoft);
  root.style.setProperty("--color-in-use-soft", theme.colors.inUseSoft);
  root.style.setProperty("--color-maintenance-soft", theme.colors.maintenanceSoft);
  root.style.setProperty("--color-button-primary", theme.colors.buttonPrimary);
  root.style.setProperty(
    "--color-button-primary-hover",
    theme.colors.buttonPrimaryHover,
  );
  root.style.setProperty("--color-button-disabled", theme.colors.buttonDisabled);
  root.style.setProperty(
    "--color-button-disabled-text",
    theme.colors.buttonDisabledText,
  );
  root.style.setProperty("--radius-card", theme.radius.card);
  root.style.setProperty("--radius-button", theme.radius.button);
  root.style.setProperty("--radius-badge", theme.radius.badge);
  root.style.setProperty("--spacing-section", theme.spacing.section);
  root.style.setProperty("--spacing-card-gap", theme.spacing.cardGap);
  root.style.setProperty("--spacing-card-padding", theme.spacing.cardPadding);
  root.style.setProperty("--shadow-card", theme.shadows.card);
}
