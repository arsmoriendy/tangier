export function marginAndDiscount(sell: number, buy: number) {
  const margin = sell - buy
  const discount = buy === 0 ? 0 : ((buy - sell) / buy) * 100
  return { margin, discount }
}
