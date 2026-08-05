"use client"

import type { MouseEvent, ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, UnfoldMoreIcon, UserSettings02Icon } from "@hugeicons/core-free-icons"

import { isSupabaseConfigured } from "@/lib/env"
import { createClient } from "@/lib/supabase/browser"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { adminNavItems } from "@/data/admin-nav"
import { cn } from "@/lib/utils"

type AdminUser = {
  name: string
  role: string
}

type AdminShellProps = {
  brand: string
  user: AdminUser
  actions?: ReactNode
  children: ReactNode
}

function isActiveHref(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href)
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function AdminShell({ brand, user, actions, children }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut(event: MouseEvent) {
    if (!isSupabaseConfigured()) {
      return
    }

    event.preventDefault()
    await createClient().auth.signOut()
    router.push("/admin/sign-in")
    router.refresh()
  }

  return (
    <div className="min-h-svh bg-secondary text-foreground">
      <div className="grid min-h-svh grid-cols-1 gap-3 p-3 md:gap-4 md:p-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5 lg:p-5">
        <aside className="rounded-2xl bg-sidebar px-5 py-5 text-sidebar-foreground lg:sticky lg:top-5 lg:h-[calc(100svh-2.5rem)] lg:rounded-[1.4rem]">
          <div className="flex min-h-full flex-col">
            <div className="font-heading text-2xl font-semibold tracking-normal">{brand}</div>

            <nav className="mt-8 grid gap-1 text-sm" aria-label="Admin navigation">
              {adminNavItems.map((item) => {
                const active = isActiveHref(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    className={cn(
                      "flex h-10 items-center gap-2.5 rounded-lg px-3 font-medium transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:outline-none",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    href={item.href}
                  >
                    <HugeiconsIcon aria-hidden="true" className="size-4" icon={item.icon} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="mt-auto flex items-center gap-3 rounded-xl bg-sidebar-accent p-3 text-left transition-colors duration-150 hover:bg-sidebar-accent/80 focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:outline-none"
              >
                <Avatar>
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-sidebar-foreground">{user.name}</p>
                  <p className="truncate text-xs text-sidebar-foreground/68">{user.role}</p>
                </div>
                <HugeiconsIcon aria-hidden="true" className="size-4 shrink-0 text-sidebar-foreground/58" icon={UnfoldMoreIcon} strokeWidth={1.5} />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <HugeiconsIcon aria-hidden="true" icon={UserSettings02Icon} strokeWidth={1.5} />
                    Account settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleSignOut}
                  render={<Link href="/admin/sign-in" />}
                >
                  <HugeiconsIcon aria-hidden="true" icon={Logout01Icon} strokeWidth={1.5} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <div className="min-w-0 overflow-hidden rounded-2xl lg:min-h-[calc(100svh-2.5rem)] lg:rounded-[1.4rem]">
          <div className="min-h-full">
            {actions ? (
              <div className="sticky top-0 z-20 flex min-h-14 justify-end px-4 py-3 md:px-8 lg:hidden">
                {actions}
              </div>
            ) : null}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
