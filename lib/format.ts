export function formatKickoffAt(kickoffAt: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(kickoffAt));
}

function formatNumber(amount: number): string {
  return new Intl.NumberFormat("ja-JP").format(amount);
}

export function formatAmount(amount: number): string {
  return `${formatNumber(amount)}A`;
}

export function formatSignedAmount(amount: number): string {
  const prefix = amount > 0 ? "+" : "";
  return `${prefix}${formatNumber(amount)}A`;
}

export function formatChips(chips: number): string {
  return formatSignedAmount(chips);
}

export function formatSettlementDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
