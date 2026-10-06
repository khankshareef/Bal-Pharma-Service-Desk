export const REOPEN_WINDOW_HOURS = 24;

const hoursSince = (iso?: string | null): number => {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
};

export const isHiddenAfterClose = (t: {
  status?: string;
  closedAt?: string | null;
  resolvedAt?: string | null;
}): boolean => {
  const status = (t.status ?? "").toUpperCase();
  if (status !== "CLOSED") return false;

  const anchor = t.closedAt ?? t.resolvedAt;
  if (!anchor) return false;

  return hoursSince(anchor) >= REOPEN_WINDOW_HOURS;
};