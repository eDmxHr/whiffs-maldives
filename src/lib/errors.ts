export function mutationErrorMessage(error: unknown, fallback: string) {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message: unknown }).message)
    : fallback
}
