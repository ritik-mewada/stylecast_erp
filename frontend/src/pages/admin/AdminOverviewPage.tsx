import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowUpRightIcon, BadgeCheckIcon, ClockIcon, StoreIcon, UsersIcon } from "lucide-react"
import { getPlatformStats, listBrands } from "@/api/brands"
import { useAuth } from "@/auth/AuthProvider"
import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { StatCard } from "@/components/StatCard"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { relativeTime } from "@/lib/format"

export function AdminOverviewPage() {
  const { session } = useAuth()
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: getPlatformStats })
  const pending = useQuery({ queryKey: ["admin", "brands", "pending"], queryFn: () => listBrands("pending") })

  return (
    <>
      <PageHeader title={`Hello, ${session?.user.firstName}`} description="Platform overview for StyleCast." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Brands" icon={<StoreIcon />} loading={stats.isPending} value={stats.data?.brands} />
        <StatCard label="Awaiting review" icon={<ClockIcon />} loading={stats.isPending} value={stats.data?.pending} />
        <StatCard label="Approved" icon={<BadgeCheckIcon />} loading={stats.isPending} value={stats.data?.approved} />
        <StatCard label="Brand users" icon={<UsersIcon />} loading={stats.isPending} value={stats.data?.users} />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Awaiting review</CardTitle>
          <CardAction>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/admin/brands" />}>
              Review
              <ArrowUpRightIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {pending.isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : pending.data?.length ? (
            <ul className="divide-y">
              {pending.data.map((brand) => (
                <li key={brand.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{brand.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {brand.brandCategory || "No category"} · {brand.contactEmail}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(brand.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No brands waiting" />
          )}
        </CardContent>
      </Card>
    </>
  )
}
