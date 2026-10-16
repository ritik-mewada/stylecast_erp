import { COLOR_SWATCH } from "@/lib/domain"
import { cn } from "@/lib/utils"

interface ProductThumbProps {
  title: string
  color?: string
  imageUrl?: string
  className?: string
}

// Placeholder tile tinted with the product's first colour until image upload exists.
export function ProductThumb({ title, color, imageUrl, className }: ProductThumbProps) {
  if (imageUrl) {
    return <img src={imageUrl} alt={title} className={cn("size-10 rounded-md object-cover", className)} />
  }
  const swatch = (color && COLOR_SWATCH[color]) ?? "#cfc6b8"
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex size-10 shrink-0 items-end overflow-hidden rounded-md border border-black/5",
        className,
      )}
      style={{ background: `linear-gradient(160deg, ${swatch} 0%, color-mix(in oklch, ${swatch}, black 18%) 100%)` }}
    >
      <span className="w-full bg-black/15 px-1 py-0.5 text-center text-[0.6em] font-semibold tracking-wide leading-none text-white/90">
        {title
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0])
          .join("")}
      </span>
    </div>
  )
}
