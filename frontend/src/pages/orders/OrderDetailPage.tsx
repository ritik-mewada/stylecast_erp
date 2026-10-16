import { useParams } from "react-router"
import { Link } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CheckIcon, PackageCheckIcon, RotateCcwIcon, TruckIcon, XIcon } from "lucide-react"
import { getOrder, refundOrder, updateOrderStatus } from "@/api/orders"
import { useAuth } from "@/auth/AuthProvider"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { ProductThumb } from "@/components/ProductThumb"
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ORDER_FLOW, ORDER_STATUS_LABEL, ORDER_TRANSITIONS, canRefund, orderTotal } from "@/lib/domain"
import { errorMessage } from "@/lib/errors"
import { formatCurrency, formatDateTime, shortId } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Order, OrderStatus } from "@/types/models"

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; icon: typeof CheckIcon }>> = {
  confirmed: { label: "Confirm order", icon: CheckIcon },
  shipped: { label: "Mark as shipped", icon: TruckIcon },
  delivered: { label: "Mark as delivered", icon: PackageCheckIcon },
}

function StatusTimeline({ order }: { order: Order }) {
  const ended = order.orderStatus === "cancelled" || order.orderStatus === "refunded"
  const reached = ended ? -1 : ORDER_FLOW.indexOf(order.orderStatus)
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
      {ORDER_FLOW.map((step, index) => {
        const done = index <= reached
        return (
          <li key={step} className="grid gap-2">
            <div className={cn("h-1.5 rounded-full bg-muted", done && "bg-brand")} />
            <div className={cn("text-xs text-muted-foreground", done && "font-medium text-foreground")}>
              {ORDER_STATUS_LABEL[step]}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function OrderDetailPage() {
  const { id = "" } = useParams()
  const { can } = useAuth()
  const queryClient = useQueryClient()
  const { data: order, isPending, error } = useQuery({ queryKey: ["orders", id], queryFn: () => getOrder(id) })

  const onSuccess = (updated: Order) => {
    queryClient.setQueryData(["orders", id], updated)
    queryClient.invalidateQueries({ queryKey: ["orders"], exact: false })
    queryClient.invalidateQueries({ queryKey: ["analytics"] })
    queryClient.invalidateQueries({ queryKey: ["inventory"] })
    queryClient.invalidateQueries({ queryKey: ["products"] })
  }
  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id, status),
    onSuccess: (updated) => {
      onSuccess(updated)
      toast.success(`Order ${ORDER_STATUS_LABEL[updated.orderStatus].toLowerCase()}`)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const refundMutation = useMutation({
    mutationFn: () => refundOrder(id),
    onSuccess: (updated) => {
      onSuccess(updated)
      toast.success("Refund processed")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  if (isPending) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <EmptyState
        title="Order not found"
        description={errorMessage(error)}
        action={
          <Button variant="outline" nativeButton={false} render={<Link to="/orders" />}>
            Back to orders
          </Button>
        }
      />
    )
  }

  const canUpdate = can("updateOrders")
  const next = ORDER_TRANSITIONS[order.orderStatus].filter((s) => s !== "cancelled")
  const cancellable = ORDER_TRANSITIONS[order.orderStatus].includes("cancelled")
  const refundable = canRefund(order.orderStatus, order.paymentStatus)
  const busy = statusMutation.isPending || refundMutation.isPending
  const subtotal = orderTotal(order.items)
  const units = order.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <>
      <PageHeader
        back={{ to: "/orders", label: "Orders" }}
        title={<span className="flex flex-wrap items-center gap-3">Order {shortId(order.id)}</span>}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          canUpdate && (
            <>
              {refundable && (
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" disabled={busy}>
                      <RotateCcwIcon />
                      Refund
                    </Button>
                  }
                  title="Refund this order?"
                  description={
                    order.orderStatus === "cancelled"
                      ? `The customer gets ${formatCurrency(subtotal)} back. Stock was already returned when the order was cancelled.`
                      : `The customer gets ${formatCurrency(subtotal)} back and ${units} ${units === 1 ? "unit returns" : "units return"} to stock.`
                  }
                  confirmLabel="Refund order"
                  destructive
                  onConfirm={() => refundMutation.mutate()}
                />
              )}
              {cancellable && (
                <ConfirmDialog
                  trigger={
                    <Button variant="outline" disabled={busy}>
                      <XIcon />
                      Cancel
                    </Button>
                  }
                  title="Cancel this order?"
                  description={`${units} ${units === 1 ? "unit goes" : "units go"} back into stock. This can't be undone.`}
                  confirmLabel="Cancel order"
                  cancelLabel="Keep order"
                  destructive
                  onConfirm={() => statusMutation.mutate("cancelled")}
                />
              )}
              {next.map((status) => {
                const action = NEXT_ACTION[status]
                if (!action) return null
                return (
                  <Button key={status} disabled={busy} onClick={() => statusMutation.mutate(status)}>
                    <action.icon />
                    {action.label}
                  </Button>
                )
              })}
            </>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid content-start gap-4 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center gap-2">
              <CardTitle className="mr-auto">Status</CardTitle>
              <OrderStatusBadge status={order.orderStatus} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </CardHeader>
            <CardContent>
              {order.orderStatus === "cancelled" || order.orderStatus === "refunded" ? (
                <p className="text-sm text-muted-foreground">
                  This order was {order.orderStatus} on {formatDateTime(order.updatedAt)}.
                </p>
              ) : (
                <StatusTimeline order={order} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Items <span className="font-normal text-muted-foreground">({units})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <ProductThumb title={item.product.title} color={item.variant.color} />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {item.product.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {item.variant.color} · {item.variant.size} · {item.variant.sku}
                      </div>
                    </div>
                    <div className="text-right text-sm tabular-nums">
                      <div>{formatCurrency(item.price * item.quantity)}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.price)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Separator className="my-3" />
              <dl className="grid gap-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex justify-between font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              <div className="font-medium">{order.customerName}</div>
              <a href={`mailto:${order.customerEmail}`} className="text-muted-foreground hover:underline">
                {order.customerEmail}
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ship to</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              <address className="not-italic">
                {order.customerName}
                <br />
                {order.shippingCity}, {order.shippingStateOrProvince} {order.shippingPostalCode}
                <br />
                {order.shippingCountry}
              </address>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
