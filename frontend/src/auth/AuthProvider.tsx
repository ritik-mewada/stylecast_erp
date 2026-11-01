import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import * as authApi from "@/api/auth"
import { setUnauthorizedHandler } from "@/api/http/client"
import type { Session } from "@/api/auth"
import { can, type Permission } from "@/lib/domain"

interface AuthContextValue {
  session: Session | null
  loading: boolean
  login: typeof authApi.login
  register: typeof authApi.register
  logout: () => Promise<void>
  can: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const SESSION_QUERY_KEY = ["session"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // Drop cached data from the previous account but keep the session query its observers watch.
  const dropBrandData = () =>
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== SESSION_QUERY_KEY[0] })
  const { data, isPending } = useQuery({ queryKey: SESSION_QUERY_KEY, queryFn: authApi.getSession })

  // The API stopped accepting the token (expired, password changed elsewhere,
  // account removed): sign out here too, and the route guards send the user to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== SESSION_QUERY_KEY[0] })
      queryClient.setQueryData(SESSION_QUERY_KEY, null)
    })
  }, [queryClient])

  const value: AuthContextValue = {
    session: data ?? null,
    loading: isPending,
    login: async (input) => {
      const session = await authApi.login(input)
      dropBrandData()
      queryClient.setQueryData(SESSION_QUERY_KEY, session)
      return session
    },
    register: async (input) => {
      const session = await authApi.register(input)
      dropBrandData()
      queryClient.setQueryData(SESSION_QUERY_KEY, session)
      return session
    },
    logout: async () => {
      await authApi.logout()
      dropBrandData()
      queryClient.setQueryData(SESSION_QUERY_KEY, null)
    },
    can: (permission) => can(data?.user.role, permission),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
