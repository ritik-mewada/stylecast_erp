import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2Icon } from "lucide-react"
import { useAuth } from "@/auth/AuthProvider"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorMessage } from "@/lib/errors"

const schema = z.object({
  firstName: z.string().trim().min(1, "Required"),
  lastName: z.string().trim().min(1, "Required"),
  brandName: z.string().trim().min(2, "Enter your brand name"),
  brandSlug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
})

type FormValues = z.infer<typeof schema>

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export function RegisterPage() {
  const { register: registerAccount } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", brandName: "", brandSlug: "", email: "", password: "" },
  })
  const { errors, isSubmitting, dirtyFields } = form.formState
  const brandName = form.register("brandName", {
    onChange: (event) => {
      if (dirtyFields.brandSlug) return
      form.setValue("brandSlug", slugify(event.target.value))
    },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await registerAccount(values)
      navigate("/", { replace: true })
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Register your brand</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You'll be the brand owner. A StyleCast admin reviews every new brand before it can take orders.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-4" noValidate>
        {error && (
          <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message}>
            <Input
              id="firstName"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              {...form.register("firstName")}
            />
          </FormField>
          <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
            <Input
              id="lastName"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              {...form.register("lastName")}
            />
          </FormField>
        </div>
        <FormField label="Brand name" htmlFor="brandName" error={errors.brandName?.message}>
          <Input id="brandName" autoComplete="organization" aria-invalid={!!errors.brandName} {...brandName} />
        </FormField>
        <FormField
          label="Brand URL"
          htmlFor="brandSlug"
          error={errors.brandSlug?.message}
          hint="Used in your storefront link. You can't change it later."
        >
          <div className="flex items-center rounded-lg border border-input bg-transparent focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
            <span className="pl-2.5 text-sm text-muted-foreground">stylecast.com/</span>
            <input
              id="brandSlug"
              className="h-8 min-w-0 flex-1 bg-transparent pr-2.5 text-sm outline-none"
              aria-invalid={!!errors.brandSlug}
              {...form.register("brandSlug")}
            />
          </div>
        </FormField>
        <FormField label="Work email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...form.register("email")}
          />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message} hint="At least 8 characters">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...form.register("password")}
          />
        </FormField>
        <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
