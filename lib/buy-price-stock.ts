type StockLinkedItem = {
  readonly buyPriceId: string | null
  readonly updateStock: boolean
  readonly quantity: number
}

/**
 * Net stock change per buy price when `prevItems` are replaced by `nextItems`.
 *
 * Every buy price linked in either list is considered, so removing a row,
 * unlinking it, or pointing it at a different buy price still restores the
 * stock the previous transaction took. Zero deltas are dropped.
 */
export function buyPriceStockDeltas(
  prevItems: readonly StockLinkedItem[],
  nextItems: readonly StockLinkedItem[]
) {
  const deltas = new Map<string, number>()

  function accumulate(items: readonly StockLinkedItem[], sign: 1 | -1) {
    for (const { buyPriceId, updateStock, quantity } of items) {
      if (!updateStock || buyPriceId === null) continue
      deltas.set(buyPriceId, (deltas.get(buyPriceId) ?? 0) + sign * quantity)
    }
  }

  accumulate(prevItems, 1)
  accumulate(nextItems, -1)

  for (const [buyPriceId, delta] of deltas)
    if (delta === 0) deltas.delete(buyPriceId)

  return deltas
}
