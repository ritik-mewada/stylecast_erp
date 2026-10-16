import { Link, useNavigate, useSearchParams } from "react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { PlusIcon, ShirtIcon } from "lucide-react"
import { listProducts } from "@/api/products"
import { useAuth } from "@/auth/AuthProvider"
import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { Pagination } from "@/components/Pagination"
import { ProductThumb } from "@/components/ProductThumb"
import { SearchInput } from "@/components/SearchInput"
import { SimpleSelect } from "@/components/SimpleSelect"
import { Pill } from "@/components/StatusBadge"
import { TableSkeleton } from "@/components/TableSkeleton"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDebounced } from "@/hooks/useDebounced"
import { CATEGORIES, isLowStock, totalStock } from "@/lib/domain"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { Product, ProductStatus } from "@/types/models"

const LIMIT = 12

const CATEGORY_OPTIONS = [{ value: "all", label: "All categories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]
const STATUS_OPTIONS = [
  { value: "all", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
]

function StockSummary({ product }: { product: Product }) {
  const stock = totalStock(product)
  const low = product.variants.filter(isLowStock).length
  return (
    <div>
      <div className="tabular-nums">{formatNumber(stock)} units</div>
      <div className="text-xs text-muted-foreground">
        {product.variants.length} variants
        {low > 0 && (
          <span className="text-[color-mix(in_oklch,var(--warning),var(--foreground)_35%)]"> · {low} low</span>
        )}
      </div>
    </div>
  )
}

export function ProductsPage() {
  const navigate = useNavigate()
  const { can } = useAuth()
  const [params, setParams] = useSearchParams()
  const category = params.get("category") ?? "all"
  const status = (params.get("status") ?? "all") as ProductStatus | "all"
  const page = Number(params.get("page") ?? 1)
  const search = params.get("q") ?? ""
  const debouncedSearch = useDebounced(search)

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === "all" || (key === "page" && value === "1")) next.delete(key)
      else next.set(key, value)
    }
    if (!("page" in changes)) next.delete("page")
    setParams(next, { replace: true })
  }

  const query = {
    page,
    limit: LIMIT,
    category: category === "all" ? undefined : category,
    status: status === "all" ? undefined : status,
    search: debouncedSearch || undefined,
  }
  const { data, isPending } = useQuery({
    queryKey: ["products", query],
    queryFn: () => listProducts(query),
    placeholderData: keepPreviousData,
  })
  const filtered = category !== "all" || status !== "all" || !!search

  return (
    <>
      <PageHeader
        title="Products"
        description="Your catalogue, variants and pricing."
        actions={
          can("editProducts") && (
            <Button nativeButton={false} render={<Link to="/products/new" />}>
              <PlusIcon />
              Add product
            </Button>
          )
        }
      />
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-2 border-b p-3 sm:flex-row">
          <SearchInput
            className="sm:max-w-xs sm:flex-1"
            value={search}
            onChange={(q) => update({ q })}
            placeholder="Search title or SKU"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <SimpleSelect
              aria-label="Filter by category"
              className="sm:w-44"
              value={category}
              onChange={(v) => update({ category: v })}
              options={CATEGORY_OPTIONS}
            />
            <SimpleSelect
              aria-label="Filter by status"
              className="sm:w-36"
              value={status}
              onChange={(v) => update({ status: v })}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Product</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell">Stock</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="pr-4 text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeleton columns={5} />
            ) : data?.data.length ? (
              data.data.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <ProductThumb
                        title={product.title}
                        color={product.variants[0]?.color}
                        imageUrl={product.images[0]?.imageUrl}
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/products/${product.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block max-w-56 truncate font-medium hover:underline"
                        >
                          {product.title}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {[...new Set(product.variants.map((v) => v.color))].join(", ")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{product.category}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StockSummary product={product} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {product.status === "active" ? (
                      <Pill tone="success">Active</Pill>
                    ) : (
                      <Pill tone="neutral">Archived</Pill>
                    )}
                  </TableCell>
                  <TableCell className="pr-4 text-right tabular-nums">{formatCurrency(product.price)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={<ShirtIcon />}
                    title={filtered ? "No products match these filters" : "No products yet"}
                    description={
                      filtered ? "Try a different category or search." : "Add your first product to start selling."
                    }
                    action={
                      filtered ? (
                        <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                          Clear filters
                        </Button>
                      ) : (
                        can("editProducts") && (
                          <Button nativeButton={false} render={<Link to="/products/new" />}>
                            <PlusIcon />
                            Add product
                          </Button>
                        )
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data && data.total > 0 && (
          <Pagination page={page} limit={LIMIT} total={data.total} onPageChange={(p) => update({ page: String(p) })} />
        )}
      </Card>
    </>
  )
}
