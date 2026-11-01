// The one error type the API layer throws, from the real API and the mock alike.
// Mirrors the backend's { status: "error", message, details? } responses.
export class ApiError extends Error {
  status: number
  details?: Record<string, unknown>
  constructor(status: number, message: string, details?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.details = details
  }
}
