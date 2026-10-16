import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
import { listProducts } from "@/api/products"
import { listShippingRules } from "@/api/shipping"
import { useAuth } from "@/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Step {
  title: string
  description: string
  done: boolean
  to?: string
}

// First-run checklist for a new brand. Hides itself once every step is done.
export function GettingStarted() {
  const { session, can } = useAuth()
  const products = useQuery({ queryKey: ["products", { limit: 1 }], queryFn: () => listProducts({ limit: 1 }) })
  const shipping = useQuery({ queryKey: ["shipping"], queryFn: listShippingRules })
  const brand = session?.brand

  if (!brand || products.isPending || shipping.isPending) return null

  const steps: Step[] = [
    {
      title: "Complete your brand profile",
      description: "Add a short description and where you ship from.",
      done: !!brand.companyInfo && !!brand.shippingOrigin,
      to: can("editBrand") ? "/settings" : undefined,
    },
    {
      title: "Add your first product",
      description: "Create a product with its colours and sizes, then set stock.",
      done: (products.data?.total ?? 0) > 0,
      to: can("editProducts") ? "/products/new" : undefined,
    },
    {
      title: "Set up shipping",
      description: "Add a rate for each region you ship to.",
      done: (shipping.data?.length ?? 0) > 0,
      to: can("editShipping") ? "/shipping" : undefined,
    },
    {
      title: "Get approved",
      description:
        brand.approvalStatus === "rejected"
          ? "Your application wasn't approved. Contact StyleCast support."
          : "A StyleCast admin reviews your brand. Orders open once you're approved.",
      done: brand.approvalStatus === "approved",
    },
  ]

  const completed = steps.filter((s) => s.done).length
  if (completed === steps.length) return null

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Get your brand ready</CardTitle>
        <CardDescription>
          {completed} of {steps.length} done
        </CardDescription>
        <div
          className="col-span-full mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Setup progress"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={steps.length}
        >
          <div
            className="h-full rounded-full bg-brand transition-[width]"
            style={{ width: `${(completed / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-1">
          {steps.map((step, index) => {
            const body = (
              <>
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums",
                    step.done && "border-transparent bg-success text-white",
                  )}
                >
                  {step.done ? <CheckIcon className="size-3.5" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm font-medium", step.done && "text-muted-foreground line-through")}>
                    {step.title}
                  </span>
                  {!step.done && <span className="block text-xs text-muted-foreground">{step.description}</span>}
                </span>
                {step.to && !step.done && <ChevronRightIcon className="size-4 text-muted-foreground" />}
              </>
            )
            return (
              <li key={step.title}>
                {step.to && !step.done ? (
                  <Link to={step.to} className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/60">
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 py-2">{body}</div>
                )}
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
