import { describe, expect, test } from "vitest"
import { quantifiedSellPrice } from "./quantified-sell-price"

describe("quantifiedSellPrice", () => {
  test("falls back to sellPrice * quantity when null", () => {
    expect(
      quantifiedSellPrice({
        sellPrice: 3500,
        quantity: 3,
        quantifiedSellPrice: null,
      })
    ).toBe(10500)
  })

  test("uses the persisted value when present", () => {
    expect(
      quantifiedSellPrice({
        sellPrice: 3500,
        quantity: 3,
        quantifiedSellPrice: 10000,
      })
    ).toBe(10000)
  })

  test("allows a persisted value of zero", () => {
    expect(
      quantifiedSellPrice({
        sellPrice: 3500,
        quantity: 3,
        quantifiedSellPrice: 0,
      })
    ).toBe(0)
  })
})
