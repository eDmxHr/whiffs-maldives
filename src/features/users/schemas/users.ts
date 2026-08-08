import { z } from "zod"

export const updateUserRoleSchema = z.object({
  role: z.enum(["Owner", "Manager", "Staff"]),
})

export const inviteUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["Owner", "Manager", "Staff"]),
})
