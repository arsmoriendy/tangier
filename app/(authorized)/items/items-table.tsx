"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { ItemWithRelations } from "@/lib/crud/item"
import { formatCurrency } from "@/lib/i18n/currency"

export function ItemsTable(props: { items: ItemWithRelations[] }) {
  const { priceGroups } = usePriceGroups()

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
