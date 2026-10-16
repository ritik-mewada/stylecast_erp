import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { SalesPoint } from "@/types/models"
import { formatCompactCurrency, formatCurrency, formatShortDate } from "@/lib/format"

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: SalesPoint }[] }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="text-muted-foreground">{formatShortDate(point.date)}</div>
      <div className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">{formatCurrency(point.revenue)}</div>
      <div className="text-muted-foreground tabular-nums">
        {point.orders} {point.orders === 1 ? "order" : "orders"}
      </div>
    </div>
  )
}

// Round axis steps (1, 2, 2.5 or 5 × 10^n) so ticks read $500, $1K, $1.5K instead of $650, $1.3K.
const niceTicks = (max: number, count = 4) => {
  if (max <= 0) return [0, 250, 500, 750, 1000]
  const raw = max / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? 10 * magnitude
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step)
}

export function RevenueChart({ data }: { data: SalesPoint[] }) {
  const ticks = niceTicks(Math.max(0, ...data.map((d) => d.revenue)))
  return (
    <div className="h-64 w-full" role="img" aria-label="Daily revenue over the last 30 days">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            tickFormatter={(v: number) => formatCompactCurrency(v)}
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#revenueFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)", fill: "var(--chart-1)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
