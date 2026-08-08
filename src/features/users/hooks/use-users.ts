"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getUsers, inviteUser, updateUserRole, type InviteUserInput } from "@/features/users/api/users"
import type { AdminUser } from "@/types/users"

export const userKeys = {
  users: ["users"] as const,
}

export function useUsers() {
  return useQuery({ queryKey: userKeys.users, queryFn: getUsers })
}

export function useUserMutations() {
  const queryClient = useQueryClient()

  return {
    updateRole: useMutation({
      mutationFn: ({ id, role }: { id: string; role: AdminUser["role"] }) => updateUserRole(id, role),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: userKeys.users })
      },
    }),
    inviteUser: useMutation({
      mutationFn: (input: InviteUserInput) => inviteUser(input),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: userKeys.users })
      },
    }),
  }
}
