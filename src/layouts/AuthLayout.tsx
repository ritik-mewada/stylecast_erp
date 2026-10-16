import { Outlet } from "react-router"
import { Logo, LogoMark } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"

export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute -top-32 -right-24 size-[28rem] rounded-full opacity-35 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--brand), transparent 70%)" }}
        />
        <div className="relative flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-[-0.015em]">StyleCast</span>
        </div>
        <div className="relative max-w-md">
          <p className="text-4xl leading-[1.1] font-semibold tracking-[-0.035em] xl:text-5xl">
            Run your label like a house, not a spreadsheet.
          </p>
          <p className="mt-5 text-sm text-primary-foreground/70">
            Products, stock, orders and shipping for independent fashion brands, all in one place.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-6 border-t border-primary-foreground/15 pt-6 text-sm">
          {[
            ["Live stock", "Locked at checkout"],
            ["Order flow", "Pending to delivered"],
            ["Analytics", "Sales & conversion"],
          ].map(([title, body]) => (
            <div key={title}>
              <div className="font-medium">{title}</div>
              <div className="text-primary-foreground/60">{body}</div>
            </div>
          ))}
        </div>
      </aside>
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
