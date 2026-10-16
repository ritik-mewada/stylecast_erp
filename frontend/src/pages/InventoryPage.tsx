import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { AlertTriangleIcon, BoxesIcon, CheckIcon, PackageXIcon, Loader2Icon } from "lucide-react"
import { updateInventory } from "@/api/inventory"
import { listProducts } from "@/api/products"
import { useAuth } from "@/auth/AuthProvider"
import { EmptyState } from "@/components/EmptyState"
import { Pagination } from "@/components/Pagination"
import { PageHeader } from "@/components/PageHeader"
import { ProductThumb } from "@/components/ProductThumb"
import { SearchInput } from "@/components/SearchInput"
import { SegmentedControl } from "@/components/SegmentedControl"
import { StatCard } from "@/components/StatCard"
import { StockBadge } from "@/components/StatusBadge"
import { TableSkeleton } from "@/components/TableSkeleton"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { errorMessage } from "@/lib/errors"
import { formatNumber, relativeTime } from "@/lib/format"
import type { Product, ProductVariant } from "@/types/models"

type Filter = "all" | "low" | "out"

// Paged in the browser for now; moves to a paginated GET /inventory at API integration.
const LIMIT = 25

interface Row {
  product: Product
  variant: ProductVariant
}

function StockEditor({ row, editable }: { row: Row; editable: boolean }) {
  const queryClient = useQueryClient()
  const { inventory } = row.variant
  const [quantity, setQuantity] = useState(String(inventory.quantity))
  const [threshold, setThreshold] = useState(String(inventory.lowStockThreshold))
  const dirty = quantity !== String(inventory.quantity) || threshold !== String(inventory.lowStockThreshold)
  const valid = /^\d+$/.test(quantity) && /^\d+$/.test(threshold)

  const mutation = useMutation({
    mutationFn: () =>
      updateInventory(row.variant.id, { quantity: Number(quantity), lowStockThreshold: Number(threshold) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success(`${row.variant.sku} updated`)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  if (!editable) {
    return (
      <>
        <TableCell className="tabular-nums">{inventory.quantity}</TableCell>
        <TableCell className="hidden tabular-nums md:table-cell">{inventory.lowStockThreshold}</TableCell>
        <TableCell className="pr-4" />
      </>
    )
  }

  const submit = () => {
    if (dirty && valid && !mutation.isPending) mutation.mutate()
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit()
    if (e.key === "Escape") {
      setQuantity(String(inventory.quantity))
      setThreshold(String(inventory.lowStockThreshold))
    }
  }

  return (
    <>
      <TableCell>
        <Input
          aria-label={`Quantity for ${row.variant.sku}`}
          inputMode="numeric"
          className="h-7 w-20 tabular-nums"
          value={quantity}
          aria-invalid={!/^\d+$/.test(quantity)}
          onChange={(e) => setQuantity(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Input
          aria-label={`Low stock threshold for ${row.variant.sku}`}
          inputMode="numeric"
          className="h-7 w-16 tabular-nums"
          value={threshold}
          aria-invalid={!/^\d+$/.test(threshold)}
          onChange={(e) => setThreshold(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </TableCell>
      <TableCell className="w-24 pr-4 text-right">
        {dirty && (
          <Button size="sm" disabled={!valid || mutation.isPending} onClick={submit}>
            {mutation.isPending ? <Loader2Icon className="animate-spin" /> : <CheckIcon />}
            Save
          </Button>
        )}
      </TableCell>
    </>
  )
}

export function InventoryPage() {
  const { can } = useAuth()
  const editable = can("editInventory")
  const [params, setParams] = useSearchParams()
  const filter = (params.get("filter") ?? "all") as Filter
  const requestedPage = Number(params.get("page") ?? 1)
  const [search, setSearch] = useState("")

  const { data, isPending } = useQuery({
    queryKey: ["products", { limit: 500 }],
    queryFn: () => listProducts({ limit: 500 }),
  })

  const allRows = useMemo<Row[]>(
    () =>
      (data?.data ?? [])
        .filter((p) => p.status === "active")
        .flatMap((product) => product.variants.map((variant) => ({ product, variant }))),
    [data],
  )

  const counts = useMemo(
    () => ({
      units: allRows.reduce((sum, r) => sum + r.variant.inventory.quantity, 0),
      low: allRows.filter(
        (r) =>
          r.variant.inventory.quantity > 0 && r.variant.inventory.quantity <= r.variant.inventory.lowStockThreshold,
      ).length,
      out: allRows.filter((r) => r.variant.inventory.quantity === 0).length,
    }),
    [allRows],
  )

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return allRows
      .filter(({ variant }) => {
        const { quantity, lowStockThreshold } = variant.inventory
        if (filter === "low") return quantity <= lowStockThreshold
        if (filter === "out") return quantity === 0
        return true
      })
      .filter(
        ({ product, variant }) =>
          !term || product.title.toLowerCase().includes(term) || variant.sku.toLowerCase().includes(term),
      )
      .sort((a, b) =>
        filter === "all"
          ? a.product.title.localeCompare(b.product.title)
          : a.variant.inventory.quantity - b.variant.inventory.quantity,
      )
  }, [allRows, filter, search])

  // Clamp so saving a row that drops out of a filter can't leave you on an empty page.
  const pageCount = Math.max(1, Math.ceil(rows.length / LIMIT))
  const page = Math.min(Math.max(1, requestedPage), pageCount)
  const pageRows = rows.slice((page - 1) * LIMIT, page * LIMIT)

  const setPage = (next: number) => {
    const nextParams = new URLSearchParams(params)
    if (next <= 1) nextParams.delete("page")
    else nextParams.set("page", String(next))
    setParams(nextParams, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        description={
          editable
            ? "Edit a quantity and press Enter to save. Esc resets the row."
            : "Stock levels for every active variant."
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard label="Units on hand" icon={<BoxesIcon />} loading={isPending} value={formatNumber(counts.units)} />
        <StatCard label="Low stock" icon={<AlertTriangleIcon />} loading={isPending} value={counts.low} />
        <StatCard label="Out of stock" icon={<PackageXIcon />} loading={isPending} value={counts.out} />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center">
          <SearchInput
            className="sm:max-w-xs sm:flex-1"
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search product or SKU"
          />
          <SegmentedControl
            aria-label="Stock filter"
            value={filter}
            onChange={(f) => setParams(f === "all" ? {} : { filter: f }, { replace: true })}
            options={[
              { value: "all", label: "All" },
              { value: "low", label: "Low" },
              { value: "out", label: "Out" },
            ]}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Variant</TableHead>
              <TableHead className="hidden lg:table-cell">SKU</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead>On hand</TableHead>
              <TableHead className="hidden md:table-cell">Alert at</TableHead>
              <TableHead className="pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeleton columns={6} />
            ) : pageRows.length ? (
              pageRows.map((row) => (
                <TableRow key={row.variant.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <ProductThumb title={row.product.title} color={row.variant.color} className="size-8" />
                      <div className="min-w-0">
                        <Link
                          to={`/products/${row.product.id}`}
                          className="block max-w-48 truncate font-medium hover:underline"
                        >
                          {row.product.title}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {row.variant.color} · {row.variant.size}
                          <span className="hidden sm:inline">
                            {" "}
                            · updated {relativeTime(row.variant.inventory.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                    {row.variant.sku}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StockBadge
                      quantity={row.variant.inventory.quantity}
                      threshold={row.variant.inventory.lowStockThreshold}
                    />
                  </TableCell>
                  <StockEditor
                    key={`${row.variant.id}-${row.variant.inventory.updatedAt}`}
                    row={row}
                    editable={editable}
                  />
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={<BoxesIcon />}
                    title={filter === "all" && !search ? "No variants yet" : "Nothing matches"}
                    description={
                      filter === "all" && !search
                        ? "Add products with variants to track stock."
                        : "Every variant in this view is well stocked."
                    }
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {rows.length > 0 && <Pagination page={page} limit={LIMIT} total={rows.length} onPageChange={setPage} />}
      </Card>
    </>
  )
}
