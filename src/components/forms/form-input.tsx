import * as React from "react"
import { useController, type Control, type FieldPath, type FieldValues, type RegisterOptions } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormFieldError } from "@/components/forms/form-field-error"

type FormInputProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>
  name: TName
  label: React.ReactNode
  rules?: RegisterOptions<TFieldValues, TName>
} & Omit<React.ComponentProps<typeof Input>, "name" | "defaultValue" | "value" | "onChange" | "onBlur">

export function FormInput<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  label,
  rules,
  ...inputProps
}: FormInputProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({ control, name, rules })

  return (
    <Label>
      {label}
      <Input {...inputProps} {...field} aria-invalid={!!fieldState.error} />
      <FormFieldError message={fieldState.error?.message} />
    </Label>
  )
}
