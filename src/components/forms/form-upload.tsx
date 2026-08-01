"use client"

import * as React from "react"
import { useController, type Control, type FieldPath, type FieldValues, type RegisterOptions } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, CloudUploadIcon } from "@hugeicons/core-free-icons"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { FormFieldError } from "@/components/forms/form-field-error"

type FormUploadValue = File | File[] | null

type FormUploadProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>
  name: TName
  label: React.ReactNode
  rules?: RegisterOptions<TFieldValues, TName>
  accept?: string
  multiple?: boolean
  className?: string
}

function toFileList(value: FormUploadValue): File[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const previewUrl = React.useMemo(() => (file.type.startsWith("image/") ? URL.createObjectURL(file) : null), [file])

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <div className="flex items-center gap-3 rounded-lg border border-input bg-card px-3 py-2 text-sm">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="size-8 shrink-0 rounded-md object-cover" src={previewUrl} />
      ) : (
        <HugeiconsIcon aria-hidden="true" className="size-8 shrink-0 text-muted-foreground" icon={CloudUploadIcon} strokeWidth={1.5} />
      )}
      <span className="min-w-0 flex-1 truncate">{file.name}</span>
      <button
        aria-label={`Remove ${file.name}`}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={onRemove}
        type="button"
      >
        <HugeiconsIcon aria-hidden="true" className="size-4" icon={Cancel01Icon} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function FormUpload<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  label,
  rules,
  accept,
  multiple = false,
  className,
}: FormUploadProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({ control, name, rules })
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const files = toFileList(field.value as FormUploadValue)

  function setFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    field.onChange(multiple ? Array.from(fileList) : fileList[0])
  }

  function removeFile(index: number) {
    if (multiple) {
      const next = files.filter((_, i) => i !== index)
      field.onChange(next)
    } else {
      field.onChange(null)
    }
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <Label>
      {label}
      <div
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-input bg-card px-4 py-6 text-center transition-colors hover:bg-accent/50",
          isDragging && "border-ring bg-accent/50",
          className
        )}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          setFiles(event.dataTransfer.files)
        }}
      >
        <HugeiconsIcon aria-hidden="true" className="size-6 text-muted-foreground" icon={CloudUploadIcon} strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
        <input
          accept={accept}
          className="sr-only"
          multiple={multiple}
          name={field.name}
          onBlur={field.onBlur}
          onChange={(event) => setFiles(event.target.files)}
          ref={(node) => {
            field.ref(node)
            inputRef.current = node
          }}
          type="file"
        />
      </div>
      {files.length > 0 ? (
        <div className="mt-2 grid gap-2">
          {files.map((file, index) => (
            <FilePreview key={`${file.name}-${index}`} file={file} onRemove={() => removeFile(index)} />
          ))}
        </div>
      ) : null}
      <FormFieldError message={fieldState.error?.message} />
    </Label>
  )
}
