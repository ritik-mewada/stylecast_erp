import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-semibold tracking-[-0.04em] text-muted-foreground/50">404</p>
      <h1 className="mt-2 text-lg font-medium">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
      <Button className="mt-6" nativeButton={false} render={<Link to="/" />}>
        Go home
      </Button>
    </div>
  )
}
