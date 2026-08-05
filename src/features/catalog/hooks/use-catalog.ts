"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  addFragranceImage,
  createBottle,
  createBrand,
  createFragrance,
  createSupplier,
  deleteFragranceImage,
  getBottle,
  getBottles,
  getBrands,
  getFragrance,
  getFragrances,
  getSuppliers,
  publishFragrance,
  reorderFragranceImages,
  saveOfferings,
} from "@/features/catalog/api/catalog"
import type { Offering } from "@/types/catalog"

export const catalogKeys = {
  brands: ["brands"] as const,
  fragrances: ["fragrances"] as const,
  publishedFragrances: ["fragrances", "published"] as const,
  fragrance: (id: string) => ["fragrances", id] as const,
  bottles: ["bottles"] as const,
  bottle: (id: string) => ["bottles", id] as const,
  suppliers: ["suppliers"] as const,
}

export function useBrands() {
  return useQuery({ queryKey: catalogKeys.brands, queryFn: getBrands })
}

export function useFragrances(publishedOnly = false) {
  return useQuery({
    queryKey: publishedOnly ? catalogKeys.publishedFragrances : catalogKeys.fragrances,
    queryFn: () => getFragrances({ publishedOnly }),
  })
}

export function useFragrance(id: string) {
  return useQuery({ queryKey: catalogKeys.fragrance(id), queryFn: () => getFragrance(id) })
}

export function useBottles() {
  return useQuery({ queryKey: catalogKeys.bottles, queryFn: getBottles })
}

export function useBottle(id: string) {
  return useQuery({ queryKey: catalogKeys.bottle(id), queryFn: () => getBottle(id), enabled: Boolean(id) })
}

export function useSuppliers() {
  return useQuery({ queryKey: catalogKeys.suppliers, queryFn: getSuppliers })
}

export function useCatalogMutations() {
  const queryClient = useQueryClient()
  const refreshCatalog = () => {
    void queryClient.invalidateQueries({ queryKey: catalogKeys.brands })
    void queryClient.invalidateQueries({ queryKey: catalogKeys.fragrances })
    void queryClient.invalidateQueries({ queryKey: catalogKeys.publishedFragrances })
    void queryClient.invalidateQueries({ queryKey: catalogKeys.bottles })
    void queryClient.invalidateQueries({ queryKey: catalogKeys.suppliers })
  }

  return {
    createBrand: useMutation({ mutationFn: createBrand, onSuccess: refreshCatalog }),
    createFragrance: useMutation({ mutationFn: createFragrance, onSuccess: refreshCatalog }),
    addFragranceImage: useMutation({
      mutationFn: ({ fragranceId, publicUrl }: { fragranceId: string; publicUrl: string }) =>
        addFragranceImage(fragranceId, { publicUrl }),
      onSuccess: refreshCatalog,
    }),
    reorderFragranceImages: useMutation({
      mutationFn: ({ fragranceId, imageIds }: { fragranceId: string; imageIds: string[] }) =>
        reorderFragranceImages(fragranceId, imageIds),
      onSuccess: refreshCatalog,
    }),
    deleteFragranceImage: useMutation({
      mutationFn: ({ fragranceId, imageId }: { fragranceId: string; imageId: string }) =>
        deleteFragranceImage(fragranceId, imageId),
      onSuccess: refreshCatalog,
    }),
    saveOfferings: useMutation({
      mutationFn: ({
        fragranceId,
        offerings,
      }: {
        fragranceId: string
        offerings: Array<Pick<Offering, "sizeMl" | "price" | "suggestedPrice" | "isActive">>
      }) => saveOfferings(fragranceId, offerings),
      onSuccess: refreshCatalog,
    }),
    publishFragrance: useMutation({ mutationFn: publishFragrance, onSuccess: refreshCatalog }),
    createBottle: useMutation({ mutationFn: createBottle, onSuccess: refreshCatalog }),
    createSupplier: useMutation({ mutationFn: createSupplier, onSuccess: refreshCatalog }),
  }
}
