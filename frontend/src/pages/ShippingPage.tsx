import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ClockIcon, Loader2Icon, PencilIcon, PlusIcon, Trash2Icon, TruckIcon } from "lucide-react"
import {
  createShippingRule,
  deleteShippingRule,
  listShippingRules,
  updateShippingRule,
  type ShippingRuleInput,
} from "@/api/shipping"
import { useAuth } from "@/auth/AuthProvider"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { EmptyState } from "@/components/EmptyState"
import { FormField } from "@/components/FormField"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { errorMessage } from "@/lib/errors"
import { formatCurrency } from "@/lib/format"
import type { ShippingRule } from "@/types/models"

const schema = z.object({
  regionName: z.string().trim().min(2, "Name the region"),
  shippingFee: z.number({ error: "Enter a fee" }).min(0, "Can't be negative"),
  freeShippingThreshold: z.number({ error: "Enter an amount" }).min(0, "Can't be negative"),
  deliveryEstimate: z.string().trim().min(1, "e.g. 3–5 business days"),
})

type FormValues = z.infer<typeof schema>

function RuleDialog({
  open,
  onOpenChange,
  rule,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: ShippingRule | null
}) {
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })
  const { errors } = form.formState

  useEffect(() => {
    if (!open) return
    form.reset(
      rule
        ? {
            regionName: rule.regionName,
            shippingFee: rule.shippingFee,
            freeShippingThreshold: rule.freeShippingThreshold,
            deliveryEstimate: rule.deliveryEstimate,
          }
        : { regionName: "", deliveryEstimate: "" },
    )
  }, [open, rule, form])

  const mutation = useMutation({
    mutationFn: (input: ShippingRuleInput) => (rule ? updateShippingRule(rule.id, input) : createShippingRule(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping"] })
      toast.success(rule ? "Shipping rule updated" : "Shipping rule added")
      onOpenChange(false)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{rule ? "Edit shipping rule" : "New shipping rule"}</DialogTitle>
            <DialogDescription>Customers in this region see this rate at checkout.</DialogDescription>
          </DialogHeader>
          <FormField label="Region" htmlFor="regionName" error={errors.regionName?.message}>
            <Input
              id="regionName"
              placeholder="e.g. United States"
              aria-invalid={!!errors.regionName}
              {...form.register("regionName")}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Shipping fee" htmlFor="shippingFee" error={errors.shippingFee?.message}>
              <Input
                id="shippingFee"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={!!errors.shippingFee}
                {...form.register("shippingFee", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Free over" htmlFor="freeShippingThreshold" error={errors.freeShippingThreshold?.message}>
              <Input
                id="freeShippingThreshold"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={!!errors.freeShippingThreshold}
                {...form.register("freeShippingThreshold", {
                  valueAsNumber: true,
                })}
              />
            </FormField>
          </div>
          <FormField label="Delivery estimate" htmlFor="deliveryEstimate" error={errors.deliveryEstimate?.message}>
            <Input
              id="deliveryEstimate"
              placeholder="e.g. 3–5 business days"
              aria-invalid={!!errors.deliveryEstimate}
              {...form.register("deliveryEstimate")}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2Icon className="animate-spin" />}
              {rule ? "Save" : "Add rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ShippingPage() {
  const { can } = useAuth()
  const editable = can("editShipping")
  const deletable = can("deleteShipping")
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ShippingRule | null>(null)
  const { data, isPending } = useQuery({
    queryKey: ["shipping"],
    queryFn: listShippingRules,
  })

  const remove = useMutation({
    mutationFn: deleteShippingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping"] })
      toast.success("Shipping rule deleted")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const openDialog = (rule: ShippingRule | null) => {
    setEditing(rule)
    setDialogOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Shipping"
        description="Rates and delivery times by region."
        actions={
          editable && (
            <Button onClick={() => openDialog(null)}>
              <PlusIcon />
              Add rule
            </Button>
          )
        }
      />

      {isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : data?.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((rule) => (
            <Card key={rule.id} className="py-0">
              <CardContent className="grid gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{rule.regionName}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ClockIcon className="size-3" />
                      {rule.deliveryEstimate}
                    </div>
                  </div>
                  {editable && (
                    <div className="-mt-1 -mr-2 flex">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${rule.regionName}`}
                        onClick={() => openDialog(rule)}
                      >
                        <PencilIcon />
                      </Button>
                      {deletable && (
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${rule.regionName}`}>
                              <Trash2Icon />
                            </Button>
                          }
                          title={`Delete ${rule.regionName}?`}
                          description="Customers in this region won't see a shipping rate until you add a new rule."
                          confirmLabel="Delete rule"
                          destructive
                          onConfirm={() => remove.mutate(rule.id)}
                        />
                      )}
                    </div>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-3 border-t pt-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">Fee</dt>
                    <dd className="text-lg font-semibold tabular-nums">{formatCurrency(rule.shippingFee)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Free over</dt>
                    <dd className="text-lg font-semibold tabular-nums">{formatCurrency(rule.freeShippingThreshold)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<TruckIcon />}
            title="No shipping rules yet"
            description="Add a rule for each region you ship to."
            action={
              editable && (
                <Button onClick={() => openDialog(null)}>
                  <PlusIcon />
                  Add rule
                </Button>
              )
            }
          />
        </Card>
      )}

      <RuleDialog open={dialogOpen} onOpenChange={setDialogOpen} rule={editing} />
    </>
  )
}
