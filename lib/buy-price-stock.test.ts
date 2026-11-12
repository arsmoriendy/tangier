import { describe, expect, test } from "vitest"
import { buyPriceStockDeltas } from "./buy-price-stock"

function item(buyPriceId: string | null, quantity: number, updateStock = true) {
  return { buyPriceId, updateStock, quantity }
}

function deltas(
  prevItems: ReturnType<typeof item>[],
  nextItems: ReturnType<typeof item>[]
) {
  return Object.fromEntries(buyPriceStockDeltas(prevItems, nextItems))
}

describe("buyPriceStockDeltas", () => {
  test("takes stock for a new transaction", () => {
    expect(deltas([], [item("a", 2)])).toEqual({ a: -2 })
  })

  test("sums rows sharing a buy price", () => {
    expect(deltas([], [item("a", 2), item("a", 3)])).toEqual({ a: -5 })
  })

  test("restores stock of a removed row", () => {
    expect(deltas([item("a", 2), item("b", 3)], [item("a", 2)])).toEqual({
      b: 3,
    })
  })

  test("restores stock when decrement is turned off", () => {
    expect(deltas([item("a", 2)], [item("a", 2, false)])).toEqual({ a: 2 })
  })

  test("moves stock when the buy price changes", () => {
    expect(deltas([item("b", 2)], [item("c", 2)])).toEqual({ b: 2, c: -2 })
  })

  test("nets a quantity change", () => {
    expect(deltas([item("a", 2)], [item("a", 5)])).toEqual({ a: -3 })
  })

  test("drops unchanged and unlinked rows", () => {
    expect(
      deltas([item("a", 2), item(null, 4)], [item("a", 2), item(null, 7)])
    ).toEqual({})
  })

  test("skips rows that never moved stock", () => {
    expect(deltas([item("a", 2, false)], [item("a", 2, false)])).toEqual({})
  })
})
