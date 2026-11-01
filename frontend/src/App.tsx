import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/auth/AuthProvider"
import { RedirectIfAuthed, RequireAuth, RequirePermission } from "@/auth/guards"
import { FullPageSpinner } from "@/components/FullPageSpinner"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminLayout } from "@/layouts/AdminLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { BrandLayout } from "@/layouts/BrandLayout"
import { RouteErrorPage } from "@/pages/RouteErrorPage"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: false },
  },
})

// Each page is its own chunk, fetched the first time its route is visited.
type PageModule = Record<string, React.ComponentType>
const page = (load: () => Promise<PageModule>, name: string): Pick<RouteObject, "lazy"> => ({
  lazy: async () => ({ Component: (await load())[name] }),
})

const pages = {
  login: page(() => import("@/pages/auth/LoginPage"), "LoginPage"),
  register: page(() => import("@/pages/auth/RegisterPage"), "RegisterPage"),
  forgotPassword: page(() => import("@/pages/auth/ForgotPasswordPage"), "ForgotPasswordPage"),
  resetPassword: page(() => import("@/pages/auth/ResetPasswordPage"), "ResetPasswordPage"),
  dashboard: page(() => import("@/pages/DashboardPage"), "DashboardPage"),
  orders: page(() => import("@/pages/orders/OrdersPage"), "OrdersPage"),
  newOrder: page(() => import("@/pages/orders/NewOrderPage"), "NewOrderPage"),
  orderDetail: page(() => import("@/pages/orders/OrderDetailPage"), "OrderDetailPage"),
  products: page(() => import("@/pages/products/ProductsPage"), "ProductsPage"),
  productEditor: page(() => import("@/pages/products/ProductEditorPage"), "ProductEditorPage"),
  inventory: page(() => import("@/pages/InventoryPage"), "InventoryPage"),
  shipping: page(() => import("@/pages/ShippingPage"), "ShippingPage"),
  team: page(() => import("@/pages/TeamPage"), "TeamPage"),
  settings: page(() => import("@/pages/SettingsPage"), "SettingsPage"),
  account: page(() => import("@/pages/AccountPage"), "AccountPage"),
  adminOverview: page(() => import("@/pages/admin/AdminOverviewPage"), "AdminOverviewPage"),
  brandApprovals: page(() => import("@/pages/admin/BrandApprovalsPage"), "BrandApprovalsPage"),
  notFound: page(() => import("@/pages/NotFoundPage"), "NotFoundPage"),
}

// Errors inside the app shell keep the sidebar; errors in the shell itself fall back to a full page.
const inShell = (children: RouteObject[]): RouteObject[] => [{ errorElement: <RouteErrorPage inline />, children }]

const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <FullPageSpinner />,
    children: [
      {
        element: <RedirectIfAuthed />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: "/login", ...pages.login },
              { path: "/register", ...pages.register },
              { path: "/forgot-password", ...pages.forgotPassword },
            ],
          },
        ],
      },
      // The reset link works signed in or not: a reset signs every session out anyway.
      {
        element: <AuthLayout />,
        children: [{ path: "/reset-password", ...pages.resetPassword }],
      },
      {
        path: "/admin",
        element: <RequireAuth admin />,
        children: [
          {
            element: <AdminLayout />,
            children: inShell([
              { index: true, ...pages.adminOverview },
              { path: "brands", ...pages.brandApprovals },
              { path: "account", ...pages.account },
              { path: "*", ...pages.notFound },
            ]),
          },
        ],
      },
      {
        path: "/",
        element: <RequireAuth />,
        children: [
          {
            element: <BrandLayout />,
            children: inShell([
              { index: true, ...pages.dashboard },
              { path: "orders", ...pages.orders },
              { path: "orders/new", ...pages.newOrder },
              { path: "orders/:id", ...pages.orderDetail },
              { path: "products", ...pages.products },
              { path: "products/new", ...pages.productEditor },
              { path: "products/:id", ...pages.productEditor },
              { path: "inventory", ...pages.inventory },
              { path: "shipping", ...pages.shipping },
              {
                element: <RequirePermission permission="viewTeam" />,
                children: [{ path: "team", ...pages.team }],
              },
              { path: "settings", ...pages.settings },
              { path: "account", ...pages.account },
              { path: "*", ...pages.notFound },
            ]),
          },
        ],
      },
    ],
  },
], { basename: import.meta.env.BASE_URL })

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
