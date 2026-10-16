import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  loading?: boolean
}

export function StatCard({ label, value, hint, icon, loading }: StatCardProps) {
  return (
    <Card className="gap-2 px-4 py-3.5 sm:gap-3 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground sm:text-sm">
        <span>{label}</span>
        {icon && <span className="hidden text-muted-foreground/70 sm:block [&_svg]:size-4">{icon}</span>}
      </div>
      {loading ? (
        <Skeleton className="h-7 w-full max-w-24 sm:h-8" />
      ) : (
        <div className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{value}</div>
      )}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </Card>
  )
}
