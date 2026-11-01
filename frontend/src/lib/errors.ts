import { ApiError } from "@/api/errors"

export const errorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}

export const errorStatus = (error: unknown) => (error instanceof ApiError ? error.status : undefined)
