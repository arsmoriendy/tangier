import { expect, it } from "vitest"
import { formatCols } from "./format-cols"

it("handles fitted text", () => {
  expect(
    formatCols({
      align: ["l", "r"],
      width: 10,
      cols: ["foo", "bar"],
      gap: 1,
      prioritizeColIdx: 1,
    })
  ).toBe("foo    bar")
})

it("handles overflowed text", () => {
  expect(
    formatCols({
      align: ["l", "r"],
      width: 5,
      cols: ["foo", "bar"],
      gap: 1,
      prioritizeColIdx: 1,
    })
  ).toBe("f bar")

  expect(
    formatCols({
      align: ["l", "r"],
      width: 33,
      cols: ["1 TOPLES X 44.000", "44.000"],
      gap: 1,
      prioritizeColIdx: 1,
    })
  ).toBe("1 TOPLES X 44.000        44.000")

  expect(
    formatCols({
      align: ["l", "r"],
      width: 4,
      cols: ["foo", "bar"],
      gap: 1,
      prioritizeColIdx: 1,
    })
  ).toBe(" bar")

  expect(
    formatCols({
      align: ["l", "r"],
      width: 2,
      cols: ["foo", "bar"],
      gap: 1,
      prioritizeColIdx: 1,
    })
  ).toBe("ba")
})
