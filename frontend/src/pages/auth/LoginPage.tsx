import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRightIcon, Loader2Icon } from "lucide-react"
import { DEMO_MODE } from "@/api/mode"
import { useAuth } from "@/auth/AuthProvider"
import { homeFor } from "@/auth/guards"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorMessage } from "@/lib/errors"

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
})

type FormValues = z.infer<typeof schema>

// Accounts from the mock seed, shown only in demo mode (no VITE_API_URL).
const DEMO_ACCOUNTS = [
  { email: "camille@maisonondine.example", label: "Brand owner", name: "Camille" },
  { email: "jordan@maisonondine.example", label: "Brand manager", name: "Jordan" },
  { email: "priya@maisonondine.example", label: "Operations", name: "Priya" },
  { email: "admin@stylecast.example", label: "Platform admin", name: "Ava" },
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      const session = await login(values)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && session.user.role !== "platform_admin" ? from : homeFor(session.user.role), { replace: true })
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your brand.</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-4" noValidate>
        {error && (
          <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...form.register("email")}
          />
        </FormField>
        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          labelAction={
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...form.register("password")}
          />
        </FormField>
        <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to StyleCast?{" "}
        <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Register your brand
        </Link>
      </p>

      {DEMO_MODE && (
        <div className="mt-10 rounded-xl border border-dashed p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Demo accounts</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={isSubmitting}
                onClick={() => onSubmit({ email: account.email, password: "password" })}
                className="group flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-foreground/25 disabled:opacity-50"
              >
                <span>
                  <span className="block font-medium">{account.name}</span>
                  <span className="block text-xs text-muted-foreground">{account.label}</span>
                </span>
                <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
