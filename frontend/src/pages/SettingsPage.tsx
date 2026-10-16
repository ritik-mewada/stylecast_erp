import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import { getMyBrand, updateMyBrand } from "@/api/brands"
import { SESSION_QUERY_KEY, useAuth } from "@/auth/AuthProvider"
import { FormField } from "@/components/FormField"
import { PageHeader } from "@/components/PageHeader"
import { ApprovalBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { errorMessage } from "@/lib/errors"
import { formatDate } from "@/lib/format"

const schema = z.object({
  name: z.string().trim().min(2, "Enter your brand name"),
  brandCategory: z.string().trim(),
  companyInfo: z.string().trim().max(500, "Keep it under 500 characters"),
  website: z.union([z.url("Enter a full URL, including https://"), z.literal("")]),
  shippingOrigin: z.string().trim(),
  contactEmail: z.union([z.email("Enter a valid email"), z.literal("")]),
  contactPhone: z.string().trim(),
})

type FormValues = z.infer<typeof schema>

export function SettingsPage() {
  const { can } = useAuth()
  const editable = can("editBrand")
  const queryClient = useQueryClient()
  const { data: brand, isPending } = useQuery({ queryKey: ["brand"], queryFn: getMyBrand })
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })
  const { errors, isDirty } = form.formState

  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name,
        brandCategory: brand.brandCategory,
        companyInfo: brand.companyInfo,
        website: brand.website,
        shippingOrigin: brand.shippingOrigin,
        contactEmail: brand.contactEmail,
        contactPhone: brand.contactPhone,
      })
    }
  }, [brand, form])

  const mutation = useMutation({
    mutationFn: updateMyBrand,
    onSuccess: (updated) => {
      queryClient.setQueryData(["brand"], updated)
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      toast.success("Brand profile saved")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  if (isPending || !brand) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
      <PageHeader
        title="Brand settings"
        description="How your brand appears to customers and StyleCast."
        actions={
          editable && (
            <Button type="submit" disabled={!isDirty || mutation.isPending}>
              {mutation.isPending && <Loader2Icon className="animate-spin" />}
              Save changes
            </Button>
          )
        }
      />
      <fieldset disabled={!editable} className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField label="Brand name" htmlFor="name" error={errors.name?.message}>
                <Input id="name" aria-invalid={!!errors.name} {...form.register("name")} />
              </FormField>
              <FormField label="Category" htmlFor="brandCategory" hint="e.g. Womenswear, Accessories">
                <Input id="brandCategory" {...form.register("brandCategory")} />
              </FormField>
              <FormField
                label="About"
                htmlFor="companyInfo"
                error={errors.companyInfo?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="companyInfo"
                  rows={4}
                  aria-invalid={!!errors.companyInfo}
                  {...form.register("companyInfo")}
                />
              </FormField>
              <FormField label="Website" htmlFor="website" error={errors.website?.message}>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://"
                  aria-invalid={!!errors.website}
                  {...form.register("website")}
                />
              </FormField>
              <FormField label="Ships from" htmlFor="shippingOrigin" hint="City and region">
                <Input id="shippingOrigin" {...form.register("shippingOrigin")} />
              </FormField>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Used by StyleCast support. Not shown to customers.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email" htmlFor="contactEmail" error={errors.contactEmail?.message}>
                <Input
                  id="contactEmail"
                  type="email"
                  aria-invalid={!!errors.contactEmail}
                  {...form.register("contactEmail")}
                />
              </FormField>
              <FormField label="Phone" htmlFor="contactPhone">
                <Input id="contactPhone" type="tel" {...form.register("contactPhone")} />
              </FormField>
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Approval</dt>
                <dd className="mt-1">
                  <ApprovalBadge status={brand.approvalStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Brand URL</dt>
                <dd className="font-mono text-xs">{brand.slug}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Member since</dt>
                <dd>{formatDate(brand.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </fieldset>
    </form>
  )
}
