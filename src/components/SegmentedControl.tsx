import { cn } from "@/lib/utils"

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  "aria-label": string
}

export function SegmentedControl<T extends string>({ value, onChange, options, ...rest }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={rest["aria-label"]} className="inline-flex rounded-lg bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-7 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
            value === option.value && "bg-background font-medium text-foreground shadow-sm",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
