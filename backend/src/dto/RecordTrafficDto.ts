import { IsInt, IsISO8601, Matches, Min } from "class-validator";

export class RecordTrafficDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "metricDate must be a date (YYYY-MM-DD)" })
  @IsISO8601({ strict: true }, { message: "metricDate must be a real calendar date" })
  metricDate!: string;

  @IsInt({ message: "sessions must be an integer" })
  @Min(0, { message: "sessions cannot be negative" })
  sessions!: number;

  @IsInt({ message: "ordersPlaced must be an integer" })
  @Min(0, { message: "ordersPlaced cannot be negative" })
  ordersPlaced!: number;
}
