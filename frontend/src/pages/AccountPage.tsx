import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import { changePassword, updateProfile } from "@/api/auth"
import { SESSION_QUERY_KEY, useAuth } from "@/auth/AuthProvider"
import { FormField } from "@/components/FormField"
import { PageHeader } from "@/components/PageHeader"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ROLE_LABEL } from "@/lib/domain"
import { errorMessage } from "@/lib/errors"
import { formatDate, initials } from "@/lib/format"

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Required"),
  lastName: z.string().trim().min(1, "Required"),
  email: z.email("Enter a valid email"),
})
type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
type PasswordValues = z.infer<typeof passwordSchema>

function ProfileCard() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const user = session!.user
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user.firstName, lastName: user.lastName, email: user.email },
  })
  const { errors, isDirty } = form.formState

  useEffect(() => {
    form.reset({ firstName: user.firstName, lastName: user.lastName, email: user.email })
  }, [user.firstName, user.lastName, user.email, form])

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (next) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, next)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Profile updated")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <Card>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="contents">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your name and the email you sign in with.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
          <FormField label="Email" htmlFor="email" error={errors.email?.message} className="sm:col-span-2">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={!isDirty || mutation.isPending}>
            {mutation.isPending && <Loader2Icon className="animate-spin" />}
            Save profile
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function PasswordCard() {
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })
  const { errors } = form.formState

  const mutation = useMutation({
    mutationFn: (values: PasswordValues) =>
      changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      form.reset()
      toast.success("Password changed")
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <Card>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="contents">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Use at least 8 characters. You'll stay signed in on this device.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-sm">
          <FormField label="Current password" htmlFor="currentPassword" error={errors.currentPassword?.message}>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.currentPassword}
              {...form.register("currentPassword")}
            />
          </FormField>
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
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2Icon className="animate-spin" />}
            Change password
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function AccountPage() {
  const { session } = useAuth()
  if (!session) return null
  const { user, brand } = session

  return (
    <>
      <PageHeader title="Your account" description="Personal details and sign-in settings." />
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="grid content-start gap-4">
          <ProfileCard />
          <PasswordCard />
        </div>
        <Card className="h-fit">
          <CardContent className="grid justify-items-center gap-3 text-center">
            <Avatar size="lg" className="size-14">
              <AvatarFallback className="bg-accent text-base text-accent-foreground">
                {initials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {ROLE_LABEL[user.role]}
                {brand && ` · ${brand.name}`}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Member since {formatDate(user.createdAt)}</div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
