import { useNavigate, useSearchParams } from "react-router"
import { Link } from "react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PlusIcon, ReceiptTextIcon } from "lucide-react"
import { listOrders } from "@/api/orders"
import { useAuth } from "@/auth/AuthProvider"
import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { Pagination } from "@/components/Pagination"
import { SearchInput } from "@/components/SearchInput"
import { SimpleSelect } from "@/components/SimpleSelect"
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge"
import { TableSkeleton } from "@/components/TableSkeleton"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDebounced } from "@/hooks/useDebounced"
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, orderTotal } from "@/lib/domain"
import { formatCurrency, formatDateTime, shortId } from "@/lib/format"
import type { OrderStatus, PaymentStatus } from "@/types/models"

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label })),
]
const PAYMENT_OPTIONS = [
  { value: "all", label: "All payments" },
  ...Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => ({ value, label })),
]

const LIMIT = 15

export function OrdersPage() {
  const navigate = useNavigate()
  const { can, session } = useAuth()
  const [params, setParams] = useSearchParams()
  const status = (params.get("status") ?? "all") as OrderStatus | "all"
  const payment = (params.get("payment") ?? "all") as PaymentStatus | "all"
  const page = Number(params.get("page") ?? 1)
  const search = params.get("q") ?? ""
  const debouncedSearch = useDebounced(search)

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === "all" || (key === "page" && value === "1")) next.delete(key)
      else next.set(key, value)
    }
    if (!("page" in changes)) next.delete("page")
    setParams(next, { replace: true })
  }

  const query = {
    page,
    limit: LIMIT,
    status: status === "all" ? undefined : status,
    paymentStatus: payment === "all" ? undefined : payment,
    search: debouncedSearch || undefined,
  }
  const { data, isPending } = useQuery({
    queryKey: ["orders", query],
    queryFn: () => listOrders(query),
    placeholderData: keepPreviousData,
  })

  const approved = session?.brand?.approvalStatus === "approved"
  const filtered = status !== "all" || payment !== "all" || !!search

  return (
    <>
      <PageHeader
        title="Orders"
        description="Track fulfilment from pending through delivery."
        actions={
          can("createOrders") && (
            <Button
              nativeButton={false}
              render={<Link to="/orders/new" />}
              disabled={!approved}
              title={approved ? undefined : "Available once your brand is approved"}
            >
              <PlusIcon />
              New order
            </Button>
          )
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row">
          <SearchInput
            className="sm:max-w-xs sm:flex-1"
            value={search}
            onChange={(q) => update({ q })}
            placeholder="Search customer, email or order #"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <SimpleSelect
              aria-label="Filter by status"
              className="sm:w-40"
              value={status}
              onChange={(v) => update({ status: v })}
              options={STATUS_OPTIONS}
            />
            <SimpleSelect
              aria-label="Filter by payment"
              className="sm:w-40"
              value={payment}
              onChange={(v) => update({ payment: v })}
              options={PAYMENT_OPTIONS}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Placed</TableHead>
              <TableHead className="hidden sm:table-cell">Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeleton columns={6} />
            ) : data?.data.length ? (
              data.data.map((order) => (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                  <TableCell className="pl-4 font-medium">
                    <Link to={`/orders/${order.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                      {shortId(order.id)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-44 truncate">{order.customerName}</div>
                    <div className="hidden text-xs text-muted-foreground lg:block">
                      {[order.shippingCity, order.shippingStateOrProvince].filter(Boolean).join(", ")}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.orderStatus} />
                  </TableCell>
                  <TableCell className="pr-4 text-right tabular-nums">
                    {formatCurrency(orderTotal(order.items))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={<ReceiptTextIcon />}
                    title={filtered ? "No orders match these filters" : "No orders yet"}
                    description={filtered ? "Try a different status or search term." : "New orders will show up here."}
                    action={
                      filtered && (
                        <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                          Clear filters
                        </Button>
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data && data.total > 0 && (
          <Pagination page={page} limit={LIMIT} total={data.total} onPageChange={(p) => update({ page: String(p) })} />
        )}
      </Card>
    </>
  )
}
