"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignInForm() {
  const [message, setMessage] = useState("")

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        setMessage("Local-first demo mode is active. Opening the owner workspace.")
        window.location.href = "/admin"
      }}
    >
      <Label>
        Email
        <Input
          defaultValue="owner@whiffsmaldives.mv"
          type="email"
        />
      </Label>
      <Label>
        Password
        <Input
          defaultValue="local-first"
          type="password"
        />
      </Label>
      <Button type="submit">Sign in</Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  )
}
