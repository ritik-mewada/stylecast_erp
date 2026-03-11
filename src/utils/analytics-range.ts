// A tiny utility used by the analytics service to convert a range string
// ("daily", "weekly", "monthly") into an actual start date for DB queries.
// Returns null if no range is given, which the service treats as "all time".

export type AnalyticsRange = "daily" | "weekly" | "monthly";

export const getRangeStartDate = (range?: string): Date | null => {
  const now = new Date();

  if (range === "daily") {
    const start = new Date(now);
    start.setDate(now.getDate() - 1);
    return start;
  }

  if (range === "weekly") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return start;
  }

  if (range === "monthly") {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 1);
    return start;
  }

  return null;
};
