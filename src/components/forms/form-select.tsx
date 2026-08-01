import * as React from "react"
import { useController, type Control, type FieldPath, type FieldValues, type RegisterOptions } from "react-hook-form"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormFieldError } from "@/components/forms/form-field-error"

export type FormSelectItem = { label: string; value: string }

type FormSelectProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>
  name: TName
  label: React.ReactNode
  items: FormSelectItem[]
  rules?: RegisterOptions<TFieldValues, TName>
  placeholder?: string
  groupLabel?: string
  triggerClassName?: string
}

export function FormSelect<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  label,
  items,
  rules,
  placeholder,
  groupLabel,
  triggerClassName,
}: FormSelectProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({ control, name, rules })

  return (
    <Label>
      {label}
      <Select items={items} name={field.name} value={field.value || null} onValueChange={(value) => field.onChange(value ?? "")}>
        <SelectTrigger className={triggerClassName} aria-invalid={!!fieldState.error} onBlur={field.onBlur}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {groupLabel ? <SelectLabel>{groupLabel}</SelectLabel> : null}
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FormFieldError message={fieldState.error?.message} />
    </Label>
  )
}
