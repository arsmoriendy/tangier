import { describe, expect, test } from "vitest"
import {
  flattenTrxPages,
  nextTrxPageParam,
  shouldFetchNextPage,
} from "./trx-pagination"

const PAGE_SIZE = 2

describe("nextTrxPageParam", () => {
  test("asks for the next page when the page is full", () => {
    expect(nextTrxPageParam([{}, {}], 0, PAGE_SIZE)).toBe(1)
  })

  test("stops on a short page", () => {
    expect(nextTrxPageParam([{}], 3, PAGE_SIZE)).toBeUndefined()
  })

  test("stops on an empty page", () => {
    expect(nextTrxPageParam([], 0, PAGE_SIZE)).toBeUndefined()
  })

  test("keeps counting from the current page", () => {
    expect(nextTrxPageParam([{}, {}], 7, PAGE_SIZE)).toBe(8)
  })
})

describe("flattenTrxPages", () => {
  test("flattens pages in order", () => {
    expect(
      flattenTrxPages([[{ id: "a" }, { id: "b" }], [{ id: "c" }]]).map(
        (trx) => trx.id
      )
    ).toEqual(["a", "b", "c"])
  })

  test("keeps only the first occurrence of a transaction", () => {
    expect(
      flattenTrxPages([
        [{ id: "a" }, { id: "b" }],
        [{ id: "b" }, { id: "c" }],
      ]).map((trx) => trx.id)
    ).toEqual(["a", "b", "c"])
  })

  test("returns nothing for no pages", () => {
    expect(flattenTrxPages([])).toEqual([])
  })
})

describe("shouldFetchNextPage", () => {
  const base = {
    loadedCount: 3,
    hasNextPage: true,
    isFetchingNextPage: false,
  }

  test("fetches when the last loaded row is visible", () => {
    expect(shouldFetchNextPage({ ...base, lastVisibleIndex: 2 })).toBe(true)
  })

  test("fetches when the loader row is visible", () => {
    expect(shouldFetchNextPage({ ...base, lastVisibleIndex: 3 })).toBe(true)
  })

  test("waits while rows below the viewport are still loaded", () => {
    expect(shouldFetchNextPage({ ...base, lastVisibleIndex: 1 })).toBe(false)
  })

  test("does nothing when the list is exhausted", () => {
    expect(
      shouldFetchNextPage({ ...base, lastVisibleIndex: 2, hasNextPage: false })
    ).toBe(false)
  })

  test("does not stack requests", () => {
    expect(
      shouldFetchNextPage({
        ...base,
        lastVisibleIndex: 2,
        isFetchingNextPage: true,
      })
    ).toBe(false)
  })

  test("does nothing before the virtualizer has rows", () => {
    expect(shouldFetchNextPage({ ...base, lastVisibleIndex: -1 })).toBe(false)
  })
})
