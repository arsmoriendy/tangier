"use client"

import { FieldLegend, FieldSet } from "@/components/ui/field"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { countItems, listItems } from "@/lib/crud/items"
import { useEffect } from "react"
import { useItems } from "@/contexts/items-ctx"
import { subscribe } from "valtio"
import { useItemFilters } from "./item-filters-ctx"
import { useItemCount } from "./item-count-ctx"
import { SearchBar } from "./search-bar"
import { UnitFilter } from "./unit-filter"
import { ItemsTable } from "./items-table"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

const ITEM_LIST_TOAST_ID = "items-refetch"

export default function CreateItemForm() {
  const itemsPerPage = 10
  const disabledClass =
    "cursor-not-allowed text-muted-foreground hover:text-muted-foreground"
  const t = useTranslations("items")
  const tc = useTranslations("common")

  const { itemsProxy } = useItems()
  const { itemFiltersProxy, itemFiltersSnap } = useItemFilters()
  const { itemCount, setItemCount } = useItemCount()

  useEffect(() => {
    countItems().then(setItemCount)

    const subscriptions: (() => void)[] = []
    let seq = 0

    subscriptions.push(
      subscribe(itemFiltersProxy, async () => {
        const run = ++seq
        toast.loading(tc("loading"), { id: ITEM_LIST_TOAST_ID })
        try {
          const [items, count] = await Promise.all([
            listItems(itemFiltersProxy),
            countItems(itemFiltersProxy),
          ])
          // a newer filter change already asked for a fresher list
          if (run !== seq) return
          itemsProxy.splice(0, itemsProxy.length, ...items)
          setItemCount(count)
        } finally {
          // only the latest request may hide the toast
          if (run === seq) toast.dismiss(ITEM_LIST_TOAST_ID)
        }
      })
    )

    return () => {
      toast.dismiss(ITEM_LIST_TOAST_ID)
      for (const unsubscribe of subscriptions) unsubscribe()
    }
  }, [])

  return (
    <FieldSet>
      <FieldLegend>{t("table.itemList")}</FieldLegend>

      <SearchBar />

      <UnitFilter />

      <ItemsTable />

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={async () => {
                const offset = itemFiltersProxy.offset ?? 0
                if (offset <= 0) return
                itemFiltersProxy.offset = offset - itemsPerPage
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
                const offset = itemFiltersProxy.offset ?? 0
                if (offset + itemsPerPage >= itemCount) return
                itemFiltersProxy.offset = offset + itemsPerPage
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
