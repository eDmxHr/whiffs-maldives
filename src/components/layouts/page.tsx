import type { HTMLAttributes, ReactNode } from "react"

import type { BreadcrumbItem } from "@/components/common/breadcrumbs"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { cn } from "@/lib/utils"

type HeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
  size?: "page" | "section"
  className?: string
}

export function Heading({ eyebrow, title, description, icon, actions, size = "section", className }: HeadingProps) {
  if (size === "page") {
    return (
      <div className={cn("flex flex-col justify-between gap-5 lg:flex-row lg:items-end", className)}>
        <div className="min-w-0">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-admin-champagne">{eyebrow}</p> : null}
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-normal text-foreground md:text-5xl">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-[0.95rem]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-champagne">{eyebrow}</p> : null}
        <h2 className={cn("text-lg font-semibold text-foreground", eyebrow && "mt-1")}>{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {icon || actions ? (
        <div className="flex shrink-0 items-center gap-2">
          {icon}
          {actions}
        </div>
      ) : null}
    </div>
  )
}

type PageWrapperProps = {
  eyebrow?: string
  title?: string
  description?: string
  actions?: ReactNode
  meta?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  children: ReactNode
}

export function PageWrapper({ eyebrow, title, description, actions, meta, breadcrumbs, children }: PageWrapperProps) {
  const hasHeader = Boolean(title || breadcrumbs)

  return (
    <div className="flex min-h-svh flex-col">
      {hasHeader ? (
        <header className="border-b border-border/80 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto flex w-full max-w-360 flex-col gap-4">
            {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
            {title ? <Heading size="page" eyebrow={eyebrow} title={title} description={description} actions={actions} /> : null}
            {meta}
          </div>
        </header>
      ) : null}
      <main className="px-4 py-5 md:px-8 md:py-7">
        <div className="mx-auto w-full max-w-360">{children}</div>
      </main>
    </div>
  )
}

type SectionWrapperProps = HTMLAttributes<HTMLElement> & {
  title?: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
  headerEyebrow?: string
}

export function SectionWrapper({ title, description, icon, actions, headerEyebrow, className, children, ...props }: SectionWrapperProps) {
  return (
    <section className={cn("rounded-2xl bg-card/90", className)} {...props}>
      {title ? (
        <div className="border-b border-border/70 px-5 py-4">
          <Heading size="section" eyebrow={headerEyebrow} title={title} description={description} icon={icon} actions={actions} />
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Toolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl bg-card/90 p-3 md:flex-row md:items-center md:justify-between",
        className
      )}
      {...props}
    />
  )
}

export function Inspector({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        "rounded-2xl bg-card/90 xl:sticky xl:top-7 xl:max-h-[calc(100svh-3.5rem)] xl:overflow-auto",
        className
      )}
      {...props}
    />
  )
}
