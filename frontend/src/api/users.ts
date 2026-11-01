import type { BrandRole } from "@/types/models"
import type * as Impl from "./http/users"
import { DEMO_MODE, lazyApi } from "./mode"

export interface InviteUserInput {
  firstName: string
  lastName: string
  email: string
  role: BrandRole
  password: string
}

const api = lazyApi((): Promise<typeof Impl> => (DEMO_MODE ? import("./mock/users") : import("./http/users")))

export const listUsers = api("listUsers")
export const inviteUser = api("inviteUser")
