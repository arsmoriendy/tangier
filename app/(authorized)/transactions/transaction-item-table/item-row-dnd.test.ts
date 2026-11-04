import { describe, expect, test } from "vitest"
import { remapSelectedAfterMove } from "./item-row-dnd"

describe("remapSelectedAfterMove", () => {
  test("returns the same set when the item is not moved", () => {
    const selected = new Set([0, 2])

    expect(remapSelectedAfterMove(selected, 1, 1)).toBe(selected)
  })

  test("moves a selected item to its new index", () => {
    expect(remapSelectedAfterMove(new Set([0]), 0, 2)).toEqual(new Set([2]))
  })

  test("shifts selection down when moving an item down the list", () => {
    expect(remapSelectedAfterMove(new Set([1, 3]), 0, 2)).toEqual(
      new Set([0, 3])
    )
  })

  test("shifts selected indices when moving an item up", () => {
    expect(remapSelectedAfterMove(new Set([2]), 2, 0)).toEqual(new Set([0]))
    expect(remapSelectedAfterMove(new Set([1, 3, 4]), 2, 0)).toEqual(
      new Set([2, 3, 4])
    )
  })

  test("keeps selected rows outside the affected range unchanged", () => {
    expect(remapSelectedAfterMove(new Set([0, 3]), 1, 2)).toEqual(
      new Set([0, 3])
    )
  })
})
