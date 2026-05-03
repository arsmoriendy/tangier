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
import { useEffect, useState } from "react"
import { useItems } from "@/contexts/items-ctx"

export default function CreateItemForm() {
  const itemsPerPage = 10
  const disabledClass =
    "cursor-not-allowed text-muted-foreground hover:text-muted-foreground"

  const { itemsSnap, itemsProxy } = useItems()
  const [itemCount, setItemCount] = useState(0)
  const [page, setPage] = useState(0)
  const [searchName, setSearchName] = useState("")

  async function refreshItems() {
    itemsProxy.splice(
      0,
      itemsSnap.length,
      ...(await listItems({
        name: searchName,
        limit: itemsPerPage,
        offset: page * itemsPerPage,
      }))
    )
  }

  useEffect(() => {
    countItems().then(setItemCount)

    refreshItems()
  }, [])

  useEffect(() => {
    countItems({ name: searchName }).then(setItemCount)
    setPage(0)
    refreshItems()
  }, [searchName])

  useEffect(() => {
    refreshItems()
  }, [page])

  return (
    <FieldSet className="gap-0">
      <FieldLegend>Item list</FieldLegend>

      <SearchBar handleSearch={setSearchName} />

      <ItemsTable />

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                setPage(page - 1)
              }}
              className={page === 0 ? disabledClass : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => {
                setPage(page + 1)
              }}
              className={
                (page + 1) * itemsPerPage >= itemCount ? disabledClass : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </FieldSet>
  )
}
