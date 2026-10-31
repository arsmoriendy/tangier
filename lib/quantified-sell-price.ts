export function quantifiedSellPrice(item: {
  sellPrice: number
  quantity: number
  quantifiedSellPrice: number | null
}) {
  return item.quantifiedSellPrice ?? item.sellPrice * item.quantity
}
