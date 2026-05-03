"use client"

import { ItemsTable } from "@/app/(authorized)/items/items-table"
import { SearchBar } from "@/app/(authorized)/items/search-bar"
import { FieldLegend, FieldSet } from "@/components/ui/field"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { countItems, listItems } from "@/lib/crud/item"
import { useEffect } from "react"
import { useItems } from "@/contexts/items-ctx"
import { useItemFilters } from "@/app/(authorized)/items/item-filters-ctx"
import { useItemCount } from "@/app/(authorized)/items/item-count-ctx"
import { subscribe } from "valtio"
import { UnitFilter } from "@/app/(authorized)/items/unit-filter"

export default function CreateItemForm() {
  const itemsPerPage = 10
  const disabledClass =
    "cursor-not-allowed text-muted-foreground hover:text-muted-foreground"

  const { itemsProxy } = useItems()
  const { itemFiltersProxy, itemFiltersSnap } = useItemFilters()
  const { itemCount, setItemCount } = useItemCount()

  useEffect(() => {
    countItems().then(setItemCount)

    const subscriptions: (() => void)[] = []

    subscriptions.push(
      subscribe(itemFiltersProxy, async () => {
        itemsProxy.splice(
          0,
          itemsProxy.length,
          ...(await listItems(itemFiltersProxy))
        )
        setItemCount(await countItems(itemFiltersProxy))
      })
    )

    return () => {
      for (const unsubscribe of subscriptions) unsubscribe()
    }
  }, [])

  return (
    <FieldSet>
      <FieldLegend>Item list</FieldLegend>

      <SearchBar />

      <UnitFilter />

      <ItemsTable />

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={async () => {
                itemFiltersProxy.offset =
                  (itemFiltersProxy?.offset ?? 0) - itemsPerPage
              }}
              className={
                itemFiltersSnap.offset === 0 ||
                itemFiltersSnap.offset === undefined
                  ? disabledClass
                  : ""
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={async () => {
                itemFiltersProxy.offset =
                  (itemFiltersProxy?.offset ?? 0) + itemsPerPage
              }}
              className={
                (itemFiltersSnap?.offset ?? 0) + itemsPerPage >= itemCount
                  ? disabledClass
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </FieldSet>
  )
}
