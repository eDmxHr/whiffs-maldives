/* eslint-disable @next/next/no-img-element */

import { SignInForm } from "@/features/auth/components/sign-in-form"

export default function SignInPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-admin-reef-deep p-10 text-admin-pearl lg:flex lg:flex-col lg:justify-between">
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1887&auto=format&fit=crop"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-b from-admin-reef-deep/50 via-admin-reef-deep/80 to-admin-reef-deep"
        />

        <p className="relative text-xs font-semibold uppercase tracking-widest text-admin-champagne">
          Whiffs Maldives
        </p>

        <div className="relative max-w-md">
          <h1 className="font-heading text-4xl leading-[1.05] font-semibold">
            The workspace behind every pour.
          </h1>
          <p className="mt-4 text-sm leading-7 text-admin-pearl/70">
            Catalog, inventory, orders, and fulfillment — everything it takes to run Whiffs Maldives, in one place.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-5 py-16">
        <div className="w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne lg:hidden">
            Whiffs Maldives
          </p>
          <h1 className="mt-3 font-heading text-2xl font-semibold lg:mt-0">Sign in</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Access the Whiffs Maldives workspace with your owner account.
          </p>
          <div className="mt-6">
            <SignInForm />
          </div>
        </div>
      </div>
    </main>
  )
}
