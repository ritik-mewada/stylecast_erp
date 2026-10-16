import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
}

interface SimpleSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  id?: string
  "aria-label"?: string
  "aria-invalid"?: boolean
}

// Base UI's Select needs `items` to show labels instead of raw values; this keeps call sites short.
export function SimpleSelect({ value, onChange, options, placeholder, className, ...rest }: SimpleSelectProps) {
  return (
    <Select items={options} value={value || null} onValueChange={(next) => onChange((next as string | null) ?? "")}>
      <SelectTrigger className={cn("w-full", className)} {...rest}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
