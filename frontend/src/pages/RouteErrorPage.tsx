import { isRouteErrorResponse, useRouteError } from "react-router"
import { RotateCcwIcon } from "lucide-react"
import { LogoMark } from "@/components/Logo"
import { Button } from "@/components/ui/button"

// Shown when a route throws while rendering or loading, instead of a blank screen.
// `inline` renders inside the app shell so the sidebar stays usable.
export function RouteErrorPage({ inline = false }: { inline?: boolean }) {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : null

  if (import.meta.env.DEV && error) console.error(error)

  return (
    <div
      role="alert"
      className={
        inline
          ? "flex min-h-[60svh] flex-col items-center justify-center text-center"
          : "flex min-h-svh flex-col items-center justify-center bg-background px-4 text-center"
      }
    >
      {!inline && <LogoMark className="mb-6" />}
      <h1 className="text-2xl font-semibold tracking-[-0.025em]">
        {notFound ? "Page not found" : "Something went wrong"}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {notFound
          ? "The page you're looking for doesn't exist or has moved."
          : "This page hit an unexpected error. Reloading usually fixes it. If it keeps happening, let us know."}
      </p>
      {import.meta.env.DEV && detail && !notFound && (
        <pre className="mt-4 max-w-lg overflow-x-auto rounded-md bg-muted px-3 py-2 text-left text-xs text-muted-foreground">
          {detail}
        </pre>
      )}
      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={() => window.location.assign(import.meta.env.BASE_URL)}>
          Go home
        </Button>
        {!notFound && (
          <Button onClick={() => window.location.reload()}>
            <RotateCcwIcon />
            Reload
          </Button>
        )}
      </div>
    </div>
  )
}
