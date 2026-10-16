import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { ProductImagesCard } from "./ProductImagesCard"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2Icon, PlusIcon, Trash2Icon, WandSparklesIcon } from "lucide-react"
import { createProduct, deleteProduct, getProduct, updateProduct, type ProductInput } from "@/api/products"
import { useAuth } from "@/auth/AuthProvider"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { EmptyState } from "@/components/EmptyState"
import { FormField } from "@/components/FormField"
import { PageHeader } from "@/components/PageHeader"
import { SimpleSelect } from "@/components/SimpleSelect"
import { StockBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES, SIZES } from "@/lib/domain"
import { errorMessage } from "@/lib/errors"
import type { Product } from "@/types/models"

const optionalPrice = z.number().positive("Must be more than 0").nullable()

const schema = z.object({
  title: z.string().trim().min(2, "Enter a product name"),
  description: z.string().trim(),
  category: z.string().min(1, "Choose a category"),
  price: z.number({ error: "Enter a price" }).positive("Must be more than 0"),
  status: z.enum(["active", "archived"]),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        color: z.string().trim().min(1, "Required"),
        size: z.string().trim().min(1, "Required"),
        sku: z.string().trim().min(1, "Required"),
        material: z.string().trim(),
        priceOverride: optionalPrice,
      }),
    )
    .min(1, "Add at least one variant"),
  images: z.array(
    z.object({
      imageUrl: z.string().refine((v) => /^(https?:\/\/|data:image\/)/.test(v), "Enter a full image URL"),
      altText: z.string(),
    }),
  ),
})

export type ProductFormValues = z.infer<typeof schema>
type FormValues = ProductFormValues

const EMPTY: FormValues = {
  title: "",
  description: "",
  category: "",
  price: undefined as unknown as number,
  status: "active",
  variants: [],
  images: [],
}

const toFormValues = (product: Product): FormValues => ({
  title: product.title,
  description: product.description,
  category: product.category,
  price: product.price,
  status: product.status,
  variants: product.variants.map((v) => ({
    id: v.id,
    color: v.color,
    size: v.size,
    sku: v.sku,
    material: v.material,
    priceOverride: v.priceOverride,
  })),
  images: product.images.map((i) => ({ imageUrl: i.imageUrl, altText: i.altText })),
})

const skuFor = (title: string, color: string, size: string) => {
  const code = title
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
  return [code || "SKU", color.slice(0, 3).toUpperCase(), size.toUpperCase()].filter(Boolean).join("-")
}

const nullableNumber = (value: unknown) => (value === "" || value == null ? null : Number(value))

export function ProductEditorPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { can } = useAuth()
  const editable = can("editProducts")
  const [newColor, setNewColor] = useState("")

  const product = useQuery({ queryKey: ["products", id], queryFn: () => getProduct(id!), enabled: !isNew })

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })
  const { errors, isDirty } = form.formState
  const variants = useFieldArray({ control: form.control, name: "variants" })
  const images = useFieldArray({ control: form.control, name: "images" })

  useEffect(() => {
    if (product.data) form.reset(toFormValues(product.data))
  }, [product.data, form])

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const input: ProductInput = values
      return isNew ? createProduct(input) : updateProduct(id!, input)
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.setQueryData(["products", saved.id], saved)
      toast.success(isNew ? "Product created" : "Changes saved")
      if (isNew) navigate(`/products/${saved.id}`, { replace: true })
      else form.reset(toFormValues(saved))
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const remove = useMutation({
    mutationFn: () => deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product deleted")
      navigate("/products", { replace: true })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const addColorInAllSizes = () => {
    const color = newColor.trim()
    if (!color) return
    const title = form.getValues("title")
    const material = form.getValues("variants.0.material") ?? ""
    variants.append(
      SIZES.map((size) => ({ color, size, sku: skuFor(title, color, size), material, priceOverride: null })),
    )
    setNewColor("")
  }

  if (!isNew && product.isPending) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }
  if (!isNew && (product.error || !product.data)) {
    return (
      <EmptyState
        title="Product not found"
        description={errorMessage(product.error)}
        action={
          <Button variant="outline" nativeButton={false} render={<Link to="/products" />}>
            Back to products
          </Button>
        }
      />
    )
  }

  const stockByVariant = new Map(product.data?.variants.map((v) => [v.id, v.inventory]) ?? [])

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate>
      <PageHeader
        back={{ to: "/products", label: "Products" }}
        title={isNew ? "New product" : product.data!.title}
        description={isNew ? "New variants start with zero stock. Set quantities on the Inventory page." : undefined}
        actions={
          editable && (
            <>
              {!isNew && (
                <ConfirmDialog
                  trigger={
                    <Button type="button" variant="ghost" className="text-destructive" disabled={remove.isPending}>
                      <Trash2Icon />
                      Delete
                    </Button>
                  }
                  title="Delete this product?"
                  description="Its variants and stock records are deleted too. Past orders keep their line items."
                  confirmLabel="Delete product"
                  destructive
                  onConfirm={() => remove.mutate()}
                />
              )}
              <Button type="submit" disabled={save.isPending || (!isNew && !isDirty)}>
                {save.isPending && <Loader2Icon className="animate-spin" />}
                {isNew ? "Create product" : "Save changes"}
              </Button>
            </>
          )
        }
      />

      <fieldset disabled={!editable} className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid min-w-0 content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField label="Title" htmlFor="title" error={errors.title?.message}>
                <Input id="title" aria-invalid={!!errors.title} {...form.register("title")} />
              </FormField>
              <FormField label="Description" htmlFor="description">
                <Textarea id="description" rows={4} {...form.register("description")} />
              </FormField>
              <FormField label="Base price (USD)" htmlFor="price" error={errors.price?.message} className="sm:max-w-48">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  aria-invalid={!!errors.price}
                  {...form.register("price", { valueAsNumber: true })}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>
                Each colour and size combination is a variant with its own SKU. Leave price empty to use the base price.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {errors.variants?.root?.message || errors.variants?.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.variants?.root?.message ?? errors.variants?.message}
                </p>
              ) : null}

              {variants.fields.length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="px-2 py-2 font-medium">Colour</th>
                        <th className="px-2 py-2 font-medium">Size</th>
                        <th className="px-2 py-2 font-medium">SKU</th>
                        <th className="px-2 py-2 font-medium">Material</th>
                        <th className="px-2 py-2 font-medium">Price</th>
                        {!isNew && <th className="px-2 py-2 font-medium">Stock</th>}
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {variants.fields.map((field, index) => {
                        const rowErrors = errors.variants?.[index]
                        const variantId = form.getValues(`variants.${index}.id`)
                        const inventory = variantId ? stockByVariant.get(variantId) : undefined
                        return (
                          <tr key={field.id}>
                            <td className="p-1.5">
                              <Input
                                aria-label="Colour"
                                className="min-w-20"
                                aria-invalid={!!rowErrors?.color}
                                {...form.register(`variants.${index}.color`)}
                              />
                            </td>
                            <td className="p-1.5">
                              <Input
                                aria-label="Size"
                                className="w-16"
                                aria-invalid={!!rowErrors?.size}
                                {...form.register(`variants.${index}.size`)}
                              />
                            </td>
                            <td className="p-1.5">
                              <Input
                                aria-label="SKU"
                                className="min-w-36 font-mono text-xs"
                                aria-invalid={!!rowErrors?.sku}
                                {...form.register(`variants.${index}.sku`)}
                              />
                            </td>
                            <td className="p-1.5">
                              <Input
                                aria-label="Material"
                                className="min-w-20"
                                {...form.register(`variants.${index}.material`)}
                              />
                            </td>
                            <td className="p-1.5">
                              <Input
                                aria-label="Price override"
                                type="number"
                                step="0.01"
                                placeholder="Base"
                                className="w-24"
                                aria-invalid={!!rowErrors?.priceOverride}
                                {...form.register(`variants.${index}.priceOverride`, { setValueAs: nullableNumber })}
                              />
                            </td>
                            {!isNew && (
                              <td className="p-1.5">
                                {inventory ? (
                                  <StockBadge quantity={inventory.quantity} threshold={inventory.lowStockThreshold} />
                                ) : (
                                  <span className="text-xs text-muted-foreground">New</span>
                                )}
                              </td>
                            )}
                            <td className="p-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Remove variant"
                                onClick={() => variants.remove(index)}
                              >
                                <Trash2Icon />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {editable && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-1 gap-2">
                    <Input
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addColorInAllSizes()
                        }
                      }}
                      placeholder="New colour, e.g. Olive"
                      aria-label="New colour"
                      className="sm:max-w-56"
                    />
                    <Button type="button" variant="secondary" onClick={addColorInAllSizes} disabled={!newColor.trim()}>
                      <WandSparklesIcon />
                      Add in all sizes
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => variants.append({ color: "", size: "", sku: "", material: "", priceOverride: null })}
                  >
                    <PlusIcon />
                    Single variant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Organisation</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField label="Status" htmlFor="status">
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <SimpleSelect
                      id="status"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "active", label: "Active" },
                        { value: "archived", label: "Archived" },
                      ]}
                    />
                  )}
                />
              </FormField>
              <FormField label="Category" htmlFor="category" error={errors.category?.message}>
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <SimpleSelect
                      id="category"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Choose a category"
                      aria-invalid={!!errors.category}
                      options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                    />
                  )}
                />
              </FormField>
            </CardContent>
          </Card>

          <ProductImagesCard form={form} images={images} editable={editable} />
        </div>
      </fieldset>
    </form>
  )
}
