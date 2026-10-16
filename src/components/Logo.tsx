import { cn } from "@/lib/utils"

// Brand mark: a single-stroke "S" drawn like a loose thread. Fixed colours so it reads the same in both themes.
export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-[oklch(0.6_0.13_42)] text-white shadow-sm shadow-black/20",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[62%]" aria-hidden>
        <path
          d="M16.5 7.6C15.7 6 14 5 12 5 9.4 5 7.5 6.6 7.5 8.6c0 4.6 9 2.4 9 7 0 2-1.9 3.4-4.5 3.4-2 0-3.7-1-4.5-2.6"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export function Logo({ className, subtitle }: { className?: string; subtitle?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-[-0.015em]">StyleCast</div>
        {subtitle && (
          <div className="text-[0.65rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">{subtitle}</div>
        )}
      </div>
    </div>
  )
}
