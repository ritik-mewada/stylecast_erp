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
