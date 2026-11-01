import { describe, expect, test } from "vitest"
import { marginAndDiscount } from "./margin"

describe("marginAndDiscount", () => {
  test("computes positive margin with a negative (markup) discount", () => {
    expect(marginAndDiscount(15000, 10000)).toEqual({
      margin: 5000,
      discount: -50,
    })
  })

  test("computes negative margin as a positive discount percentage", () => {
    expect(marginAndDiscount(8000, 10000)).toEqual({
      margin: -2000,
      discount: 20,
    })
  })

  test("guards against a zero buy price", () => {
    expect(marginAndDiscount(5000, 0)).toEqual({ margin: 5000, discount: 0 })
  })

  test("handles zero margin", () => {
    expect(marginAndDiscount(10000, 10000)).toEqual({ margin: 0, discount: 0 })
  })
})
