import * as React from "react"
import { useController, type Control, type FieldPath, type FieldValues, type RegisterOptions } from "react-hook-form"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormFieldError } from "@/components/forms/form-field-error"

type FormTextareaProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>
  name: TName
  label: React.ReactNode
  rules?: RegisterOptions<TFieldValues, TName>
} & Omit<React.ComponentProps<typeof Textarea>, "name" | "defaultValue" | "value" | "onChange" | "onBlur">

export function FormTextarea<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  label,
  rules,
  ...textareaProps
}: FormTextareaProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({ control, name, rules })

  return (
    <Label>
      {label}
      <Textarea {...textareaProps} {...field} aria-invalid={!!fieldState.error} />
      <FormFieldError message={fieldState.error?.message} />
    </Label>
  )
}
