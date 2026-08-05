"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getSettings, updateSettings } from "@/features/settings/api/settings"

export const settingsKeys = {
  settings: ["settings"] as const,
}

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.settings, queryFn: getSettings })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.settings })
    },
  })
}
