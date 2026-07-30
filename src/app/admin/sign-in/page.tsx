import Link from "next/link"

import { Card } from "@/components/ui/card"
import { SignInForm } from "@/features/auth/components/sign-in-form"

export default function SignInPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-[#f8f6ef] px-5 text-[#22231f]">
      <Card className="w-full max-w-md border-[#ddd5c3] bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7c6a3d]">Whiffs Maldives</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold">Owner sign in</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Local-first mode opens the owner workspace without live Supabase credentials. Add Supabase env values later to
          switch this into real authentication.
        </p>
        <div className="mt-6">
          <SignInForm />
        </div>
        <Link className="mt-5 block text-sm text-[#7c6a3d]" href="/">
          View customer catalog
        </Link>
      </Card>
    </main>
  )
}
