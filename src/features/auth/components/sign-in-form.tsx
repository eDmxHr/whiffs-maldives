"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { isSupabaseConfigured } from "@/lib/env"
import { createClient } from "@/lib/supabase/browser"

type SignInFormValues = {
  email: string
  password: string
}

export function SignInForm() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SignInFormValues>({
    defaultValues: { email: "owner@whiffsmaldives.mv", password: "local-first" },
  })

  async function submit(values: SignInFormValues) {
    setMessage("")

    if (!isSupabaseConfigured()) {
      setMessage("Local-first demo mode is active. Opening the owner workspace.")
      router.push("/admin")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password })
    setIsSubmitting(false)

    if (error) {
      setMessage(error.message)
      return
    }

    router.push("/admin")
    router.refresh()
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
      <FormInput control={form.control} name="email" label="Email" type="email" rules={{ required: "Enter your email." }} />
      <FormInput
        control={form.control}
        name="password"
        label="Password"
        type="password"
        rules={{ required: "Enter your password." }}
      />
      <Button type="submit" loading={isSubmitting} loadingText="Signing in...">
        Sign in
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  )
}
