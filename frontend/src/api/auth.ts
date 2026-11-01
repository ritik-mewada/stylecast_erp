import type { Brand, User } from "@/types/models"
import type * as Impl from "./http/auth"
import { DEMO_MODE, lazyApi } from "./mode"

export interface Session {
  user: User
  brand: Brand | null
}

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
  brandName: string
  brandSlug: string
}

export type UpdateProfileInput = Pick<User, "firstName" | "lastName" | "email">

const api = lazyApi((): Promise<typeof Impl> => (DEMO_MODE ? import("./mock/auth") : import("./http/auth")))

export const getSession = api("getSession")
export const login = api("login")
export const register = api("register")
export const logout = api("logout")
export const requestPasswordReset = api("requestPasswordReset")
export const updateProfile = api("updateProfile")
export const changePassword = api("changePassword")
