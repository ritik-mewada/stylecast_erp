import { Link, Navigate, Outlet, useLocation } from "react-router"
import { LockIcon } from "lucide-react"
import { useAuth } from "./AuthProvider"
import { EmptyState } from "@/components/EmptyState"
import { FullPageSpinner } from "@/components/FullPageSpinner"
import { Button } from "@/components/ui/button"
import type { Permission } from "@/lib/domain"

export const homeFor = (role: string | undefined) => (role === "platform_admin" ? "/admin" : "/")

export function RequireAuth({ admin = false }: { admin?: boolean }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  const isAdmin = session.user.role === "platform_admin"
  if (admin !== isAdmin) return <Navigate to={homeFor(session.user.role)} replace />
  return <Outlet />
}

export function RedirectIfAuthed() {
  const { session, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (session) return <Navigate to={homeFor(session.user.role)} replace />
  return <Outlet />
}

// Page-level check for pages a role can't open at all (the API would answer 403).
export function RequirePermission({ permission }: { permission: Permission }) {
  const { can } = useAuth()
  if (can(permission)) return <Outlet />
  return (
    <EmptyState
      icon={<LockIcon />}
      title="You don't have access to this page"
      description="Ask your brand owner if you need it."
      action={
        <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
          Back to dashboard
        </Button>
      }
    />
  )
}
