import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2Icon, MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react"
import { createOrder } from "@/api/orders"
import { listProducts } from "@/api/products"
import { useAuth } from "@/auth/AuthProvider"
import { EmptyState } from "@/components/EmptyState"
import { FormField } from "@/components/FormField"
import { PageHeader } from "@/components/PageHeader"
import { ProductThumb } from "@/components/ProductThumb"
import { SearchInput } from "@/components/SearchInput"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { variantPrice } from "@/lib/domain"
import { errorMessage } from "@/lib/errors"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Product, ProductVariant } from "@/types/models"

const schema = z.object({
  customerName: z.string().trim().min(1, "Required"),
  customerEmail: z.email("Enter a valid email"),
  shippingCountry: z.string().trim().min(1, "Required"),
  shippingCity: z.string().trim().min(1, "Required"),
  shippingStateOrProvince: z.string().trim().min(1, "Required"),
  shippingPostalCode: z.string().trim().min(1, "Required"),
})

type FormValues = z.infer<typeof schema>

interface Line {
  product: Product
  variant: ProductVariant
  quantity: number
}

export function NewOrderPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [lines, setLines] = useState<Line[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const products = useQuery({
    queryKey: ["products", { status: "active", limit: 500 }],
    queryFn: () => listProducts({ status: "active", limit: 500 }),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      shippingCountry: "Canada",
      shippingCity: "",
      shippingStateOrProvince: "",
      shippingPostalCode: "",
    },
  })
  const { errors } = form.formState

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createOrder({ ...values, items: lines.map((l) => ({ variantId: l.variant.id, quantity: l.quantity })) }),
    onSuccess: (order) => {
      queryClient.invalidateQueries()
      toast.success("Order created")
      navigate(`/orders/${order.id}`)
    },
    onError: (e) => setSubmitError(errorMessage(e)),
  })

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (products.data?.data ?? []).filter(
      (p) => !term || p.title.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
    )
  }, [products.data, search])

  const quantityInCart = (variantId: string) => lines.find((l) => l.variant.id === variantId)?.quantity ?? 0

  const addVariant = (product: Product, variant: ProductVariant) => {
    setSubmitError(null)
    setLines((current) => {
      const existing = current.find((l) => l.variant.id === variant.id)
      if (existing) {
        return current.map((l) =>
          l.variant.id === variant.id ? { ...l, quantity: Math.min(l.quantity + 1, variant.inventory.quantity) } : l,
        )
      }
      return [...current, { product, variant, quantity: 1 }]
    })
  }

  const setQuantity = (variantId: string, quantity: number) =>
    setLines((current) =>
      quantity <= 0
        ? current.filter((l) => l.variant.id !== variantId)
        : current.map((l) => (l.variant.id === variantId ? { ...l, quantity } : l)),
    )

  const total = lines.reduce((sum, l) => sum + variantPrice(l.product, l.variant) * l.quantity, 0)

  if (session?.brand?.approvalStatus !== "approved") {
    return (
      <>
        <PageHeader back={{ to: "/orders", label: "Orders" }} title="New order" />
        <Card>
          <EmptyState
            icon={<ShoppingBagIcon />}
            title="Orders open once your brand is approved"
            description="A StyleCast admin reviews every new brand. You'll be able to take orders as soon as yours is approved."
            action={
              <Button variant="outline" nativeButton={false} render={<Link to="/products" />}>
                Set up products meanwhile
              </Button>
            }
          />
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        back={{ to: "/orders", label: "Orders" }}
        title="New order"
        description="Stock is reserved as soon as the order is created."
      />

      <form
        onSubmit={form.handleSubmit((values) => {
          setSubmitError(null)
          if (!lines.length) {
            setSubmitError("Add at least one item")
            return
          }
          mutation.mutate(values)
        })}
        noValidate
        className="grid gap-4 lg:grid-cols-[1fr_380px]"
      >
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Add items</CardTitle>
              <CardDescription>Pick a colour and size. Sold-out variants can't be added.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <SearchInput value={search} onChange={setSearch} placeholder="Search products" />
              <div className="max-h-[28rem] divide-y overflow-y-auto rounded-lg border">
                {products.isPending && (
                  <div className="flex justify-center p-6">
                    <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {matches.map((product) => (
                  <div key={product.id} className="flex gap-3 p-3">
                    <ProductThumb title={product.title} color={product.variants[0]?.color} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium">{product.title}</span>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {product.variants.map((variant) => {
                          const available = variant.inventory.quantity - quantityInCart(variant.id)
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              disabled={available <= 0}
                              onClick={() => addVariant(product, variant)}
                              title={`${variant.inventory.quantity} in stock`}
                              className={cn(
                                "rounded-md border px-2 py-1 text-xs transition-colors hover:border-foreground/40 hover:bg-muted",
                                "disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through",
                                quantityInCart(variant.id) > 0 && "border-brand bg-brand/8",
                              )}
                            >
                              {variant.color} · {variant.size}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {!products.isPending && !matches.length && (
                  <EmptyState title="No products match" description="Try another search." />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer & shipping</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField label="Customer name" htmlFor="customerName" error={errors.customerName?.message}>
                <Input id="customerName" aria-invalid={!!errors.customerName} {...form.register("customerName")} />
              </FormField>
              <FormField label="Email" htmlFor="customerEmail" error={errors.customerEmail?.message}>
                <Input
                  id="customerEmail"
                  type="email"
                  aria-invalid={!!errors.customerEmail}
                  {...form.register("customerEmail")}
                />
              </FormField>
              <FormField label="City" htmlFor="shippingCity" error={errors.shippingCity?.message}>
                <Input id="shippingCity" aria-invalid={!!errors.shippingCity} {...form.register("shippingCity")} />
              </FormField>
              <FormField
                label="State / province"
                htmlFor="shippingStateOrProvince"
                error={errors.shippingStateOrProvince?.message}
              >
                <Input
                  id="shippingStateOrProvince"
                  aria-invalid={!!errors.shippingStateOrProvince}
                  {...form.register("shippingStateOrProvince")}
                />
              </FormField>
              <FormField label="Postal code" htmlFor="shippingPostalCode" error={errors.shippingPostalCode?.message}>
                <Input
                  id="shippingPostalCode"
                  aria-invalid={!!errors.shippingPostalCode}
                  {...form.register("shippingPostalCode")}
                />
              </FormField>
              <FormField label="Country" htmlFor="shippingCountry" error={errors.shippingCountry?.message}>
                <Input
                  id="shippingCountry"
                  aria-invalid={!!errors.shippingCountry}
                  {...form.register("shippingCountry")}
                />
              </FormField>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {lines.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No items yet.</p>
            ) : (
              <ul className="grid gap-3">
                {lines.map((line) => (
                  <li key={line.variant.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{line.product.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {line.variant.color} · {line.variant.size} ·{" "}
                        {formatCurrency(variantPrice(line.product, line.variant))}
                      </div>
                    </div>
                    <div className="flex items-center rounded-md border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(line.variant.id, line.quantity - 1)}
                      >
                        {line.quantity === 1 ? <Trash2Icon /> : <MinusIcon />}
                      </Button>
                      <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Increase quantity"
                        disabled={line.quantity >= line.variant.inventory.quantity}
                        onClick={() => setQuantity(line.variant.id, line.quantity + 1)}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Separator />
            <div className="flex justify-between text-sm font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>
            {submitError && (
              <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            )}
            <Button type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2Icon className="animate-spin" />}
              Create order
            </Button>
          </CardContent>
        </Card>
      </form>
    </>
  )
}
