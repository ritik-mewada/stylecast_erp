import { useState } from "react"
import { Link, useSearchParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeftIcon, CircleCheckIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react"
import { resetPassword } from "@/api/auth"
import { useAuth } from "@/auth/AuthProvider"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorMessage, errorStatus } from "@/lib/errors"

const schema = z
  .object({
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })

type FormValues = z.infer<typeof schema>

function LinkProblem({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-5" />
      </div>
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-8 grid gap-2">
        <Button size="lg" nativeButton={false} render={<Link to="/forgot-password" />}>
          Send a new link
        </Button>
        <Button size="lg" variant="ghost" nativeButton={false} render={<Link to="/login" />}>
          Back to sign in
        </Button>
      </div>
    </div>
  )
}

// Opened from the reset email: /reset-password?token=…. Works whether or not
// someone is signed in here, since a reset ends every session for the account.
export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const { session, logout } = useAuth()
  const [done, setDone] = useState(false)
  const [linkExpired, setLinkExpired] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await resetPassword({ token, newPassword: values.newPassword })
      // Whoever is signed in on this browser has just been signed out by the API.
      if (session) await logout()
      setDone(true)
    } catch (e) {
      // The API answers 400 for a link that's unknown, used or expired.
      if (errorStatus(e) === 400 && /link/i.test(errorMessage(e))) setLinkExpired(true)
      else setError(errorMessage(e))
    }
  }

  if (!token) {
    return (
      <LinkProblem
        title="This link is incomplete"
        description="Open the link from your reset email again, or ask for a new one."
      />
    )
  }

  if (linkExpired) {
    return (
      <LinkProblem
        title="This link has expired"
        description="Reset links work once and expire after an hour. Ask for a new one and use the latest email."
      />
    )
  }

  if (done) {
    return (
      <div>
        <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <CircleCheckIcon className="size-5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.025em]">Password updated</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your new password. Any other devices signed in to this account have been signed out.
        </p>
        <div className="mt-8 grid gap-2">
          <Button size="lg" nativeButton={false} render={<Link to="/login" />}>
            Sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Choose a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You'll be signed out everywhere and can sign in again with it.
      </p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-4" noValidate>
        {error && (
          <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <FormField label="New password" htmlFor="newPassword" error={errors.newPassword?.message}>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
            {...form.register("newPassword")}
          />
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...form.register("confirmPassword")}
          />
        </FormField>
        <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Update password
        </Button>
      </form>
      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to sign in
      </Link>
    </div>
  )
}
