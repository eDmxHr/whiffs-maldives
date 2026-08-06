import type { HTMLAttributes, ReactNode } from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

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

export function Heading({
  eyebrow,
  title,
  description,
  icon,
  actions,
  size = "section",
  className,
}: HeadingProps) {
  if (size === "page") {
    return (
      <div
        className={cn(
          "flex flex-col justify-between gap-3 lg:flex-row lg:items-center",
          className
        )}
      >
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold tracking-widest text-admin-champagne uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-wider text-admin-champagne uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-lg font-semibold text-foreground",
            eyebrow && "mt-1"
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
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

export function PageWrapper({
  eyebrow,
  title,
  description,
  actions,
  meta,
  breadcrumbs,
  children,
}: PageWrapperProps) {
  const hasHeader = Boolean(title || breadcrumbs)

  return (
    <div className="flex min-h-full flex-col gap-5">
      {hasHeader ? (
        <header className="px-2 pt-1 md:px-3 md:pt-2">
          <div className="flex w-full flex-col gap-3">
            {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
            {title ? (
              <Heading
                size="page"
                eyebrow={eyebrow}
                title={title}
                description={description}
                actions={actions}
              />
            ) : null}
            {meta}
          </div>
        </header>
      ) : null}
      <main>
        <div className="w-full">{children}</div>
      </main>
    </div>
  )
}

type SectionWrapperProps = HTMLAttributes<HTMLElement> & {
  title?: string
  description?: string
  icon?: IconSvgElement
  actions?: ReactNode
  headerEyebrow?: string
}

export function SectionWrapper({
  title,
  description,
  icon,
  actions,
  headerEyebrow,
  className,
  children,
  ...props
}: SectionWrapperProps) {
  return (
    <section
      className={cn("flex flex-col rounded-2xl bg-card p-2", className)}
      {...props}
    >
      {title ? (
        <div className="px-3 pt-2 pb-3">
          <Heading
            size="section"
            eyebrow={headerEyebrow}
            title={title}
            description={description}
            icon={
              icon ? (
                <HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={icon} strokeWidth={1.5} />
              ) : null
            }
            actions={actions}
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col rounded-xl bg-background p-4 md:p-5">
        {children}
      </div>
    </section>
  )
}

export function Toolbar({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col rounded-2xl bg-card p-2", className)}
      {...props}
    >
      <div className="flex flex-col gap-3 rounded-xl p-2 md:flex-row md:items-center">
        {children}
      </div>
    </div>
  )
}

export function Inspector({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        "flex flex-col rounded-2xl bg-card p-2 xl:sticky xl:top-7 xl:max-h-[calc(100svh-3.5rem)] xl:overflow-auto",
        className
      )}
      {...props}
    />
  )
}
