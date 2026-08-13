import * as React from "react"

import { cn } from "@/lib/utils"

function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 md:px-8", className)} {...props} />
}

type SectionTone = "background" | "card"

function Section({
  tone = "background",
  bordered = true,
  className,
  ...props
}: React.ComponentProps<"section"> & { tone?: SectionTone; bordered?: boolean }) {
  return (
    <section
      className={cn(bordered && "border-t border-border", tone === "card" ? "bg-card" : "bg-background", className)}
      {...props}
    />
  )
}

export { Container, Section }
