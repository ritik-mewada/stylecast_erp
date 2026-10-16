import type { BrandApprovalStatus, OrderStatus, PaymentStatus } from "@/types/models"
import { APPROVAL_STATUS_LABEL, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/domain"
import { cn } from "@/lib/utils"

type Tone = "neutral" | "info" | "brand" | "success" | "warning" | "danger"

const TONE: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info/12 text-info",
  brand: "bg-brand/12 text-brand",
  success: "bg-success/12 text-success",
  warning: "bg-warning/18 text-[color-mix(in_oklch,var(--warning),var(--foreground)_35%)]",
  danger: "bg-destructive/10 text-destructive",
}

export function Pill({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  )
}

const ORDER_TONE: Record<OrderStatus, Tone> = {
  pending: "warning",
  confirmed: "info",
  shipped: "brand",
  delivered: "success",
  cancelled: "neutral",
  refunded: "danger",
}

const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "neutral",
}

const APPROVAL_TONE: Record<BrandApprovalStatus, Tone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
}

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Pill tone={ORDER_TONE[status]}>{ORDER_STATUS_LABEL[status]}</Pill>
)

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <Pill tone={PAYMENT_TONE[status]}>{PAYMENT_STATUS_LABEL[status]}</Pill>
)

export const ApprovalBadge = ({ status }: { status: BrandApprovalStatus }) => (
  <Pill tone={APPROVAL_TONE[status]}>{APPROVAL_STATUS_LABEL[status]}</Pill>
)

export function StockBadge({ quantity, threshold }: { quantity: number; threshold: number }) {
  if (quantity === 0) return <Pill tone="danger">Out of stock</Pill>
  if (quantity <= threshold) return <Pill tone="warning">Low · {quantity}</Pill>
  return <Pill tone="success">In stock · {quantity}</Pill>
}
