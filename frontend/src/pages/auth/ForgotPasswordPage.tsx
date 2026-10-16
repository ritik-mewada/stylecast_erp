import { useState } from "react"
import { Link } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeftIcon, Loader2Icon, MailCheckIcon } from "lucide-react"
import { requestPasswordReset } from "@/api/auth"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorMessage } from "@/lib/errors"

const schema = z.object({ email: z.email("Enter a valid email") })
type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await requestPasswordReset(values)
      setSentTo(values.email)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  if (sentTo) {
    return (
      <div>
        <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheckIcon className="size-5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.025em]">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, we've sent a link to
          reset your password. It expires in 1 hour.
        </p>
        <div className="mt-8 grid gap-2">
          <Button size="lg" nativeButton={false} render={<Link to="/login" />}>
            Back to sign in
          </Button>
          <Button size="lg" variant="ghost" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter your account email and we'll send you a reset link.</p>
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
        <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Send reset link
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
