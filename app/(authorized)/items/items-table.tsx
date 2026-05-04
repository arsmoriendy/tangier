"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useItems } from "@/contexts/items-ctx"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { formatCurrency } from "@/lib/i18n/currency"

export function ItemsTable() {
  const { itemsSnap } = useItems()
  const { priceGroups } = usePriceGroups()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead rowSpan={2}>Name</TableHead>
          <TableHead rowSpan={2}>Unit</TableHead>
          <TableHead rowSpan={2}>Buy prices</TableHead>
          <TableHead colSpan={priceGroups.length}>Sell prices</TableHead>
        </TableRow>

        <TableRow>
          {priceGroups.map((pg, i) => (
            <TableHead key={i}>{pg.name}</TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {itemsSnap.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.unit.name}</TableCell>
            <TableCell className="space-y-2">
              {item.buyPrices.map((bp) => (
                <div className="flex gap-2">
                  <span>{formatCurrency(bp.price)}</span>
                  <Badge variant="secondary">{bp.stock} left</Badge>
                </div>
              ))}
            </TableCell>
            {priceGroups.map((pg, i) => {
              const price = item.sellPrices.find(
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
