export function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatCompactRupiah(value) {
  const amount = Number(value || 0);
  const formatValue = (input) => input.toFixed(1).replace(".0", "").replace(".", ",");

  if (amount >= 1000000) {
    return `Rp ${formatValue(amount / 1000000)} jt`;
  }

  if (amount >= 1000) {
    return `Rp ${formatValue(amount / 1000)}k`;
  }

  return `Rp ${amount}`;
}

export function formatDuration(totalMinutes) {
  const minutes = Math.max(0, Number(totalMinutes || 0));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} jam ${remainingMinutes} menit`;
  }

  if (hours > 0) {
    return `${hours} jam`;
  }

  return `${remainingMinutes} menit`;
}

export function formatClockDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds || 0)));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
