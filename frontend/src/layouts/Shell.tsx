import { useState, type ReactNode } from "react"
import { NavLink, Outlet, useLocation, useNavigate, useNavigation } from "react-router"
import { CircleUserIcon, LogOutIcon, MenuIcon, StoreIcon, type LucideIcon } from "lucide-react"
import { useAuth } from "@/auth/AuthProvider"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { ROLE_LABEL, type Permission } from "@/lib/domain"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: ReactNode
  permission?: Permission
}

interface ShellProps {
  nav: NavItem[]
  subtitle: string
  banner?: ReactNode
  settingsPath?: string
  accountPath: string
}

function SidebarNav({ nav, onNavigate }: { nav: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main">
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isActive && "bg-sidebar-accent font-medium text-sidebar-foreground",
            )
          }
        >
          <item.icon className="size-4" />
          <span className="flex-1">{item.label}</span>
          {item.badge}
        </NavLink>
      ))}
    </nav>
  )
}

export function Shell({ nav, subtitle, banner, settingsPath, accountPath }: ShellProps) {
  const { session, logout, can } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const navigation = useNavigation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = session?.user
  const visibleNav = nav.filter((item) => !item.permission || can(item.permission))

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-svh bg-background">
      {navigation.state === "loading" && (
        <div
          role="progressbar"
          aria-label="Loading page"
          className="fixed inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-brand"
        />
      )}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-sidebar px-3 py-4 lg:flex">
        <Logo subtitle={subtitle} className="mb-6 px-2" />
        <SidebarNav nav={visibleNav} />
        {session?.brand && (
          <div className="mt-auto rounded-lg border bg-background/60 px-3 py-2.5 text-xs">
            <div className="text-muted-foreground">Brand</div>
            <div className="truncate font-medium">{session.brand.name}</div>
          </div>
        )}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar px-3 py-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Logo subtitle={subtitle} className="mb-4 px-2" />
          <SidebarNav nav={visibleNav} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </Button>
          <Logo className="lg:hidden" />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" className="h-9 gap-2 px-1.5 sm:px-2" />}
                  aria-label="Account menu"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {initials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm sm:inline">{user.firstName}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <div className="font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs font-normal">{user.email}</div>
                      <div className="mt-1 text-xs font-normal">{ROLE_LABEL[user.role]}</div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(accountPath)}>
                    <CircleUserIcon />
                    Your account
                  </DropdownMenuItem>
                  {settingsPath && (
                    <DropdownMenuItem onClick={() => navigate(settingsPath)}>
                      <StoreIcon />
                      Brand settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOutIcon />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        {banner}
        <main key={location.pathname} className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
