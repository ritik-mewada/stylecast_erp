import { useState } from "react"
import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowUpRightIcon, BoxesIcon, PercentIcon, ReceiptTextIcon, WalletIcon } from "lucide-react"
import * as analytics from "@/api/analytics"
import { listLowStock } from "@/api/inventory"
import { listOrders } from "@/api/orders"
import { useAuth } from "@/auth/AuthProvider"
import { BarList } from "@/components/charts/BarList"
import { RevenueChart } from "@/components/charts/RevenueChart"
import { EmptyState } from "@/components/EmptyState"
import { GettingStarted } from "@/components/GettingStarted"
import { PageHeader } from "@/components/PageHeader"
import { SegmentedControl } from "@/components/SegmentedControl"
import { StatCard } from "@/components/StatCard"
import { OrderStatusBadge, StockBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ORDER_STATUS_LABEL, orderTotal } from "@/lib/domain"
import { formatCurrency, formatNumber, relativeTime, shortId } from "@/lib/format"
import type { AnalyticsRange } from "@/types/models"

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "7 days" },
  { value: "monthly", label: "30 days" },
  { value: "all_time", label: "All time" },
]

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  )
}

export function DashboardPage() {
  const { session } = useAuth()
  const [range, setRange] = useState<AnalyticsRange>("monthly")

  const overview = useQuery({ queryKey: ["analytics", "overview", range], queryFn: () => analytics.getOverview(range) })
  const conversion = useQuery({
    queryKey: ["analytics", "conversion", range],
    queryFn: () => analytics.getConversionRate(range),
  })
  const turnover = useQuery({
    queryKey: ["analytics", "turnover", range],
    queryFn: () => analytics.getInventoryTurnover(range),
  })
  const statuses = useQuery({
    queryKey: ["analytics", "order-status", range],
    queryFn: () => analytics.getOrderStatusSummary(range),
  })
  const topProducts = useQuery({
    queryKey: ["analytics", "top-products", range],
    queryFn: () => analytics.getTopProducts(range),
  })
  const sales = useQuery({ queryKey: ["analytics", "sales-series"], queryFn: () => analytics.getSalesSeries(30) })
  const lowStock = useQuery({ queryKey: ["inventory", "low-stock"], queryFn: listLowStock })
  const recent = useQuery({ queryKey: ["orders", { limit: 6 }], queryFn: () => listOrders({ limit: 6 }) })

  const avgOrder = overview.data && overview.data.totalOrders ? overview.data.totalSales / overview.data.totalOrders : 0

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${session?.user.firstName}`}
        description={`Here's how ${session?.brand?.name ?? "your brand"} is doing.`}
        actions={<SegmentedControl aria-label="Date range" value={range} onChange={setRange} options={RANGES} />}
      />

      <GettingStarted />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          icon={<WalletIcon />}
          loading={overview.isPending}
          value={formatCurrency(overview.data?.totalSales ?? 0)}
          hint={`Avg. order ${formatCurrency(avgOrder)}`}
        />
        <StatCard
          label="Orders"
          icon={<ReceiptTextIcon />}
          loading={overview.isPending}
          value={formatNumber(overview.data?.totalOrders ?? 0)}
          hint={`${overview.data?.totalActiveProducts ?? 0} of ${overview.data?.totalProducts ?? 0} products active`}
        />
        <StatCard
          label="Conversion"
          icon={<PercentIcon />}
          loading={conversion.isPending}
          value={`${conversion.data?.conversionRate ?? 0}%`}
          hint={`${formatNumber(conversion.data?.sessions ?? 0)} sessions`}
        />
        <StatCard
          label="Inventory turnover"
          icon={<BoxesIcon />}
          loading={turnover.isPending}
          value={`${turnover.data?.turnoverRate ?? 0}×`}
          hint={`${formatNumber(turnover.data?.unitsSold ?? 0)} sold · ${formatNumber(turnover.data?.currentInventoryUnits ?? 0)} on hand`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Daily, last 30 days. Cancelled orders excluded.</CardDescription>
          </CardHeader>
          <CardContent>
            {sales.isPending ? <Skeleton className="h-64 w-full" /> : <RevenueChart data={sales.data ?? []} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
            <CardDescription>{RANGES.find((r) => r.value === range)?.label}</CardDescription>
          </CardHeader>
          <CardContent>
            {statuses.isPending ? (
              <ListSkeleton />
            ) : statuses.data?.length ? (
              <BarList
                ariaLabel="Orders by status"
                items={[...statuses.data]
                  .sort((a, b) => b.count - a.count)
                  .map((s) => ({
                    key: s.status,
                    label: ORDER_STATUS_LABEL[s.status],
                    value: s.count,
                    display: formatNumber(s.count),
                  }))}
              />
            ) : (
              <EmptyState title="No orders in this period" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top products</CardTitle>
            <CardDescription>By revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.isPending ? (
              <ListSkeleton />
            ) : topProducts.data?.length ? (
              <BarList
                ariaLabel="Top products by revenue"
                items={topProducts.data.map((p) => ({
                  key: p.productId,
                  label: (
                    <Link to={`/products/${p.productId}`} className="hover:underline">
                      {p.title}
                    </Link>
                  ),
                  value: p.revenue,
                  display: `${formatCurrency(p.revenue)} · ${p.unitsSold} sold`,
                }))}
              />
            ) : (
              <EmptyState title="No sales in this period" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
            <CardDescription>
              {lowStock.data ? `${lowStock.data.length} variants at or below threshold` : "Checking stock"}
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/inventory?filter=low" />}>
                View all
                <ArrowUpRightIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {lowStock.isPending ? (
              <ListSkeleton />
            ) : lowStock.data?.length ? (
              <ul className="divide-y">
                {lowStock.data.slice(0, 5).map((item) => (
                  <li key={item.variantId} className="flex items-center justify-between gap-3 py-2 first:pt-0">
                    <div className="min-w-0">
                      <div className="truncate text-sm">{item.productTitle}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.color} · {item.size}
                      </div>
                    </div>
                    <StockBadge quantity={item.quantity} threshold={item.lowStockThreshold} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title={overview.data?.totalProducts === 0 ? "No products yet" : "Everything is well stocked"}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/orders" />}>
                View all
                <ArrowUpRightIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recent.isPending ? (
              <ListSkeleton />
            ) : recent.data?.data.length ? (
              <ul className="divide-y">
                {recent.data.data.map((order) => (
                  <li key={order.id}>
                    <Link
                      to={`/orders/${order.id}`}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted/60"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {shortId(order.id)} · {relativeTime(order.createdAt)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm tabular-nums">{formatCurrency(orderTotal(order.items))}</span>
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No orders yet" />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
