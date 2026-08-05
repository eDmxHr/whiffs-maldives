export function formatDate(value: string | number | Date) {
  return new Date(value).toLocaleDateString("en-US", { dateStyle: "medium" })
}

export function formatDateTime(value: string | number | Date) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}
