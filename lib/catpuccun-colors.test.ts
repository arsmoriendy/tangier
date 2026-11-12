import { afterEach, describe, expect, test, vi } from "vitest"
import { colors, getRandomColor, getRandomColors } from "./catpuccun-colors"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("getRandomColor", () => {
  test("can pick the last palette color", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999_999)
    expect(getRandomColor()).toBe(colors.at(-1))
  })

  test("picks a palette color", () => {
    expect(colors).toContain(getRandomColor())
  })
})

describe("getRandomColors", () => {
  test("returns n distinct colors", () => {
    const picked = getRandomColors(3)
    expect(picked).toHaveLength(3)
    expect(new Set(picked).size).toBe(3)
    for (const color of picked) expect(colors).toContain(color)
  })

  test("caps at the palette size instead of looping forever", () => {
    expect(getRandomColors(colors.length + 5)).toHaveLength(colors.length)
  })

  test("returns nothing for a non-positive count", () => {
    expect(getRandomColors(0)).toEqual([])
  })
})
