"use client"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useFilters } from "./filters-ctx"
import { useEffect, useState } from "react"
import { countTransactions } from "@/lib/crud/transactions"
import { subscribe } from "valtio"

export function TrxPagination() {
  const { setFilters, getFilters } = useFilters()
  const trxPerPage = 10
  const disabledClass =
    "cursor-not-allowed text-muted-foreground hover:text-muted-foreground"
  const [count, setCount] = useState(0)

  function updateCount() {
    countTransactions({
      from: setFilters.from,
      to: setFilters.to,
      id: setFilters.id,
    }).then(setCount)
  }

  useEffect(() => {
    updateCount()

    return subscribe(setFilters, () => {
      updateCount()
    })
  })

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={async () => {
              setFilters.offset =
                (setFilters?.offset ?? 0) - (setFilters.limit ?? trxPerPage)
            }}
            className={
              getFilters.offset === 0 || getFilters.offset === undefined
                ? disabledClass
                : ""
            }
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            onClick={async () => {
              setFilters.offset =
                (setFilters?.offset ?? 0) + (setFilters.limit ?? trxPerPage)
            }}
            className={
              (getFilters?.offset ?? 0) + (getFilters.limit ?? trxPerPage) >=
              count
                ? disabledClass
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
