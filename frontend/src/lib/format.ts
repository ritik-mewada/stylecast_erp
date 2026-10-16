const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})
const number = new Intl.NumberFormat("en-US")
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

export const formatCurrency = (value: number) => currency.format(value)
export const formatCompactCurrency = (value: number) => compactCurrency.format(value)
export const formatNumber = (value: number) => number.format(value)
export const formatDate = (iso: string) => date.format(new Date(iso))
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso))

export const shortId = (id: string) => `#${id.slice(0, 6).toUpperCase()}`

export const initials = (first: string, last?: string) => `${first[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()

export const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}
