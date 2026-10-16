import { useSearchParams } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { BadgeCheckIcon, CheckIcon, GlobeIcon, MailIcon, MapPinIcon, XIcon } from "lucide-react"
import { listBrands, setBrandApproval } from "@/api/brands"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { SegmentedControl } from "@/components/SegmentedControl"
import { ApprovalBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { errorMessage } from "@/lib/errors"
import { relativeTime } from "@/lib/format"
import type { Brand, BrandApprovalStatus } from "@/types/models"

type Tab = BrandApprovalStatus | "all"

function BrandCard({ brand }: { brand: Brand }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (status: BrandApprovalStatus) => setBrandApproval(brand.id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] })
      toast.success(`${updated.name} ${updated.approvalStatus}`)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const details = [
    { icon: MapPinIcon, value: brand.shippingOrigin },
    { icon: GlobeIcon, value: brand.website.replace(/^https?:\/\//, "") },
    { icon: MailIcon, value: brand.contactEmail },
  ].filter((d) => d.value)

  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-lg font-semibold text-accent-foreground">
          {brand.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-medium">{brand.name}</h2>
            <ApprovalBadge status={brand.approvalStatus} />
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {brand.brandCategory || "No category"} · applied {relativeTime(brand.createdAt)}
          </div>
          {brand.companyInfo && <p className="mt-2 text-sm text-muted-foreground">{brand.companyInfo}</p>}
          {details.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {details.map(({ icon: Icon, value }) => (
                <li key={value} className="flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  {value}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-2 sm:flex-col">
          {brand.approvalStatus !== "approved" && (
            <Button disabled={mutation.isPending} onClick={() => mutation.mutate("approved")}>
              <CheckIcon />
              Approve
            </Button>
          )}
          {brand.approvalStatus !== "rejected" && (
            <ConfirmDialog
              trigger={
                <Button variant="outline" disabled={mutation.isPending}>
                  <XIcon />
                  {brand.approvalStatus === "approved" ? "Revoke" : "Reject"}
                </Button>
              }
              title={`${brand.approvalStatus === "approved" ? "Revoke" : "Reject"} ${brand.name}?`}
              description="The brand keeps its data but can't take new orders. You can approve it again later."
              confirmLabel={brand.approvalStatus === "approved" ? "Revoke approval" : "Reject brand"}
              destructive
              onConfirm={() => mutation.mutate("rejected")}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function BrandApprovalsPage() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get("status") ?? "pending") as Tab
  const { data, isPending } = useQuery({
    queryKey: ["admin", "brands", tab],
    queryFn: () => listBrands(tab === "all" ? undefined : tab),
  })

  return (
    <>
      <PageHeader
        title="Brand approvals"
        description="Approved brands can take orders. Pending and rejected brands can't."
        actions={
          <SegmentedControl
            aria-label="Approval status"
            value={tab}
            onChange={(status) => setParams(status === "pending" ? {} : { status }, { replace: true })}
            options={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "all", label: "All" },
            ]}
          />
        }
      />
      {isPending ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : data?.length ? (
        <div className="grid gap-3">
          {data.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<BadgeCheckIcon />}
            title={tab === "pending" ? "You're all caught up" : "No brands here"}
            description={tab === "pending" ? "New brand applications will appear here." : undefined}
          />
        </Card>
      )}
    </>
  )
}
