import type { ReactNode } from "react"

export interface BarListItem {
  key: string
  label: ReactNode
  value: number
  display: string
}

// Horizontal single-hue bars with direct labels: easier to read than a pie for a handful of categories.
export function BarList({ items, ariaLabel }: { items: BarListItem[]; ariaLabel: string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <ul className="grid gap-2.5" aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item.key} className="group grid gap-1" title={`${item.display}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{item.label}</span>
            <span className="text-muted-foreground tabular-nums">{item.display}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-chart-1 transition-[width] duration-500 group-hover:brightness-110"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
