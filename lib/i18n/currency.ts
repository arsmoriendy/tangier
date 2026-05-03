export const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(x: number) {
  return currencyFormatter.format(x)
}
