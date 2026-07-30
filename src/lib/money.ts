export function money(value: number) {
  return `MVR ${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
}
