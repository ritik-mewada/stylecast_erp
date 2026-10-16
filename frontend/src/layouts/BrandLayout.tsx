import {
  BoxesIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  SettingsIcon,
  ShirtIcon,
  TruckIcon,
  UsersIcon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react"
import { useAuth } from "@/auth/AuthProvider"
import { Shell, type NavItem } from "./Shell"

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboardIcon, end: true },
  { to: "/orders", label: "Orders", icon: ReceiptTextIcon },
  { to: "/products", label: "Products", icon: ShirtIcon },
  { to: "/inventory", label: "Inventory", icon: BoxesIcon },
  { to: "/shipping", label: "Shipping", icon: TruckIcon },
  { to: "/team", label: "Team", icon: UsersIcon, permission: "viewTeam" },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
]

function ApprovalBanner() {
  const { session } = useAuth()
  const status = session?.brand?.approvalStatus
  if (!status || status === "approved") return null
  const rejected = status === "rejected"
  const Icon = rejected ? XCircleIcon : ClockIcon
  return (
    <div
      role="status"
      className={
        rejected
          ? "flex items-start gap-3 border-b bg-destructive/8 px-4 py-3 text-sm text-destructive sm:px-6"
          : "flex items-start gap-3 border-b bg-warning/14 px-4 py-3 text-sm sm:px-6"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p>
        {rejected ? (
          <>
            <strong className="font-medium">Your brand application was not approved.</strong> Contact StyleCast support
            to find out why or to reapply.
          </>
        ) : (
          <>
            <strong className="font-medium">Your brand is pending review.</strong> You can set up products and shipping
            now. Orders open once a StyleCast admin approves your brand.
          </>
        )}
      </p>
    </div>
  )
}

export function BrandLayout() {
  return (
    <Shell nav={NAV} subtitle="Brand ERP" banner={<ApprovalBanner />} settingsPath="/settings" accountPath="/account" />
  )
}
