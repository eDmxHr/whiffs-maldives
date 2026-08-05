"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Cancel01Icon, CloudUploadIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { FormUpload } from "@/components/forms/form-upload"
import { useCatalogMutations } from "@/features/catalog/hooks/use-catalog"
import { readFileAsDataUrl } from "@/lib/files"
import type { FragranceImage } from "@/types/catalog"

type ImageGalleryEditorProps = {
  fragranceId: string
  images: FragranceImage[]
}

type UploadForm = { files: File[] | null }

export function ImageGalleryEditor({ fragranceId, images }: ImageGalleryEditorProps) {
  const mutations = useCatalogMutations()
  const [error, setError] = useState("")
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const form = useForm<UploadForm>({ defaultValues: { files: null } })

  const sortedImages = [...images].sort((a, b) => a.position - b.position)

  async function submitUpload(values: UploadForm) {
    setError("")
    const files = values.files ?? []

    if (!files.length) {
      setError("Choose at least one image to upload.")
      return
    }

    try {
      for (const file of files) {
        const publicUrl = await readFileAsDataUrl(file)
        await mutations.addFragranceImage.mutateAsync({ fragranceId, publicUrl })
      }
      form.reset({ files: null })
      toast.add({ title: "Images uploaded.", type: "success" })
    } catch (uploadError) {
      const message =
        uploadError && typeof uploadError === "object" && "message" in uploadError
          ? String((uploadError as { message: unknown }).message)
          : "Could not upload images."
      setError(message)
    }
  }

  async function removeImage(imageId: string) {
    setError("")
    try {
      await mutations.deleteFragranceImage.mutateAsync({ fragranceId, imageId })
    } catch {
      setError("Could not remove image.")
    }
  }

  async function reorder(fromIndex: number, toIndex: number) {
    setError("")
    const next = [...sortedImages]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)

    try {
      await mutations.reorderFragranceImages.mutateAsync({ fragranceId, imageIds: next.map((image) => image.id) })
    } catch {
      setError("Could not reorder images.")
    }
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <div className="rounded-xl bg-admin-danger/12 px-4 py-3 text-sm font-medium text-admin-danger">{error}</div>
      ) : null}

      {sortedImages.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {sortedImages.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-square cursor-grab overflow-hidden rounded-xl border border-border bg-background"
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== index) {
                  void reorder(dragIndex, index)
                }
                setDragIndex(null)
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="size-full object-cover" src={image.publicUrl} />
              {index === 0 ? (
                <span className="absolute top-2 left-2 rounded-full bg-admin-reef px-2 py-0.5 text-xs font-semibold text-white">
                  Hero
                </span>
              ) : null}
              <Button
                aria-label="Remove image"
                className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                size="icon-sm"
                variant="ghost"
                onClick={() => removeImage(image.id)}
              >
                <HugeiconsIcon aria-hidden="true" icon={Cancel01Icon} strokeWidth={1.5} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No images yet. Upload one below — the first image becomes the hero.</p>
      )}

      <form className="grid gap-3" onSubmit={form.handleSubmit(submitUpload)}>
        <FormUpload control={form.control} name="files" label="Add images" accept="image/*" multiple />
        <Button className="w-fit" type="submit" loading={mutations.addFragranceImage.isPending} loadingText="Uploading...">
          <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={CloudUploadIcon} strokeWidth={1.5} />
          Upload images
        </Button>
      </form>
    </div>
  )
}
