import Link from "next/link"

import { SignInForm } from "@/features/auth/components/sign-in-form"

export default function SignInPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-secondary px-5 text-foreground">
      <div className="w-full max-w-md rounded-2xl bg-card p-2">
        <div className="rounded-xl bg-background p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Whiffs Maldives</p>
          <h1 className="mt-3 font-heading text-2xl font-semibold">Owner sign in</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in with your Whiffs Maldives owner account to access the workspace.
          </p>
          <div className="mt-6">
            <SignInForm />
          </div>
          <Link className="mt-5 block text-sm font-medium text-admin-champagne" href="/">
            View customer catalog
          </Link>
        </div>
      </div>
    </main>
  )
}
