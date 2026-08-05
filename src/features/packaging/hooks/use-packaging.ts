"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createPackagingItem,
  getPackagingItems,
  updatePackagingItem,
  type PackagingItemInput,
} from "@/features/packaging/api/packaging"

export const packagingKeys = {
  items: ["packaging-items"] as const,
}

export function usePackagingItems() {
  return useQuery({ queryKey: packagingKeys.items, queryFn: getPackagingItems })
}

export function usePackagingMutations() {
  const queryClient = useQueryClient()
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: packagingKeys.items })
  }

  return {
    createPackagingItem: useMutation({ mutationFn: createPackagingItem, onSuccess: refresh }),
    updatePackagingItem: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Partial<PackagingItemInput> }) => updatePackagingItem(id, input),
      onSuccess: refresh,
    }),
  }
}
