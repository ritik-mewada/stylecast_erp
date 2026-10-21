// Input for recording a day of marketplace traffic (POST /analytics/traffic).

export interface RecordTrafficInput {
  metricDate: string; // YYYY-MM-DD
  sessions: number;
  ordersPlaced: number;
}
