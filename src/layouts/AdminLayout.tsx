import { BadgeCheckIcon, LayoutDashboardIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getPlatformStats } from "@/api/brands"
import { Shell, type NavItem } from "./Shell"

export function AdminLayout() {
  const { data } = useQuery({ queryKey: ["admin", "stats"], queryFn: getPlatformStats })
  const nav: NavItem[] = [
    { to: "/admin", label: "Overview", icon: LayoutDashboardIcon, end: true },
    {
      to: "/admin/brands",
      label: "Brand approvals",
      icon: BadgeCheckIcon,
      badge: data?.pending ? (
        <span className="rounded-full bg-brand px-1.5 text-[0.7rem] leading-5 font-medium text-brand-foreground tabular-nums">
          {data.pending}
        </span>
      ) : undefined,
    },
  ]
  return <Shell nav={nav} subtitle="Platform admin" accountPath="/admin/account" />
}
