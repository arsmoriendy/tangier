"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ItemWithRelations } from "@/lib/crud/item"
import { listPriceGroups } from "@/lib/crud/price-group"
import { formatCurrency } from "@/lib/i18n/currency"
import { useEffect, useState } from "react"

export function ItemsTable(props: { items: ItemWithRelations[] }) {
  const [priceGroups, setPriceGroups] = useState<
    Awaited<ReturnType<typeof listPriceGroups>>
  >([])

  useEffect(() => {
    listPriceGroups().then(setPriceGroups)
  }, [])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead rowSpan={2}>Name</TableHead>
          <TableHead colSpan={priceGroups.length}>Prices</TableHead>
        </TableRow>

        <TableRow>
          {priceGroups.map((pg, i) => (
            <TableHead key={i}>{pg.name}</TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {props.items.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.name}</TableCell>
            {priceGroups.map((pg, i) => {
              const price = item.prices.find(
                (p) => p.priceGroup.id === pg.id
              )?.price

              return <TableCell key={i}>{formatCurrency(price ?? 0)}</TableCell>
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
