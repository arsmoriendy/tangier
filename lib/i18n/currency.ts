export const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
})

export function formatCurrency(x: number) {
  return currencyFormatter.format(x)
}
