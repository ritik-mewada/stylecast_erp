import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2Icon, UserMinusIcon, UserPlusIcon } from "lucide-react"
import { inviteUser, listUsers, removeUser, updateUserRole } from "@/api/users"
import { useAuth } from "@/auth/AuthProvider"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { FormField } from "@/components/FormField"
import { PageHeader } from "@/components/PageHeader"
import { SimpleSelect } from "@/components/SimpleSelect"
import { TableSkeleton } from "@/components/TableSkeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ROLE_LABEL } from "@/lib/domain"
import { errorMessage } from "@/lib/errors"
import { formatDate, initials } from "@/lib/format"
import type { BrandRole, User } from "@/types/models"

const ROLE_HELP: Record<BrandRole, string> = {
  brand_owner: "Everything, including team and approvals.",
  brand_manager: "Products, inventory, shipping and brand profile.",
  operations_manager: "Orders: create, fulfil, cancel and refund.",
}

const ROLE_OPTIONS = (Object.keys(ROLE_HELP) as BrandRole[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }))

const schema = z.object({
  firstName: z.string().trim().min(1, "Required"),
  lastName: z.string().trim().min(1, "Required"),
  email: z.email("Enter a valid email"),
  role: z.enum(["brand_owner", "brand_manager", "operations_manager"]),
  password: z.string().min(8, "At least 8 characters"),
})

type FormValues = z.infer<typeof schema>

function AddMemberDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", role: "operations_manager", password: "" },
  })
  const { errors } = form.formState
  const role = form.watch("role")

  const mutation = useMutation({
    mutationFn: inviteUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success(`${user.firstName} added to the team`)
      form.reset()
      onOpenChange(false)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add team member</DialogTitle>
            <DialogDescription>
              Share the temporary password with them directly. They can sign in right away.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name" htmlFor="m-firstName" error={errors.firstName?.message}>
              <Input id="m-firstName" aria-invalid={!!errors.firstName} {...form.register("firstName")} />
            </FormField>
            <FormField label="Last name" htmlFor="m-lastName" error={errors.lastName?.message}>
              <Input id="m-lastName" aria-invalid={!!errors.lastName} {...form.register("lastName")} />
            </FormField>
          </div>
          <FormField label="Email" htmlFor="m-email" error={errors.email?.message}>
            <Input id="m-email" type="email" aria-invalid={!!errors.email} {...form.register("email")} />
          </FormField>
          <FormField label="Role" htmlFor="m-role" hint={ROLE_HELP[role]}>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <SimpleSelect id="m-role" value={field.value} onChange={field.onChange} options={ROLE_OPTIONS} />
              )}
            />
          </FormField>
          <FormField label="Temporary password" htmlFor="m-password" error={errors.password?.message}>
            <Input
              id="m-password"
              type="text"
              autoComplete="off"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2Icon className="animate-spin" />}
              Add member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TeamPage() {
  const { can, session } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data, isPending } = useQuery({ queryKey: ["users"], queryFn: listUsers })
  // Owners manage everyone but themselves; the API refuses changes to your own account (422).
  const manages = (user: User) => can("manageUsers") && user.id !== session?.user.id

  const changeRole = useMutation({
    mutationFn: ({ user, role }: { user: User; role: BrandRole }) => updateUserRole(user.id, role),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success(`${user.firstName} is now ${ROLE_LABEL[user.role].toLowerCase()}`)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const remove = useMutation({
    mutationFn: (user: User) => removeUser(user.id),
    onSuccess: (_, user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success(`${user.firstName} removed from the team`)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <>
      <PageHeader
        title="Team"
        description="People who can sign in to your brand."
        actions={
          can("manageUsers") && (
            <Button onClick={() => setOpen(true)}>
              <UserPlusIcon />
              Add member
            </Button>
          )
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card className="gap-0 overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className={can("manageUsers") ? "hidden sm:table-cell" : "hidden pr-4 sm:table-cell"}>
                  Joined
                </TableHead>
                {can("manageUsers") && (
                  <TableHead className="w-0 pr-4">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableSkeleton columns={can("manageUsers") ? 4 : 3} rows={4} />
              ) : (
                data?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                            {initials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                            {user.id === session?.user.id && (
                              <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>
                            )}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {manages(user) && user.role !== "platform_admin" ? (
                        <SimpleSelect
                          aria-label={`Role for ${user.firstName} ${user.lastName}`}
                          className="w-36"
                          value={user.role}
                          onChange={(role) => {
                            if (role && role !== user.role) changeRole.mutate({ user, role: role as BrandRole })
                          }}
                          options={ROLE_OPTIONS}
                        />
                      ) : (
                        ROLE_LABEL[user.role]
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        can("manageUsers")
                          ? "hidden text-muted-foreground sm:table-cell"
                          : "hidden pr-4 text-muted-foreground sm:table-cell"
                      }
                    >
                      {formatDate(user.createdAt)}
                    </TableCell>
                    {can("manageUsers") && (
                      <TableCell className="pr-4 text-right">
                        {manages(user) && (
                          <ConfirmDialog
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                aria-label={`Remove ${user.firstName} ${user.lastName}`}
                                disabled={remove.isPending}
                              >
                                <UserMinusIcon />
                              </Button>
                            }
                            title={`Remove ${user.firstName} ${user.lastName}?`}
                            description="Their account is deleted and they're signed out at once. Orders and other records they worked on stay."
                            confirmLabel="Remove member"
                            destructive
                            onConfirm={() => remove.mutate(user)}
                          />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>What each role can do.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {(Object.keys(ROLE_HELP) as BrandRole[]).map((role) => (
              <div key={role}>
                <div className="font-medium">{ROLE_LABEL[role]}</div>
                <div className="text-muted-foreground">{ROLE_HELP[role]}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <AddMemberDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
