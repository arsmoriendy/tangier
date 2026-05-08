"use client"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import ItemForm from "./item-form"

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
          <Dialog key={i}>
            <DialogTrigger asChild>
              <TableRow className="cursor-pointer">
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.unit.name}</Badge>
                </TableCell>
                <TableCell className="grid w-fit grid-cols-2 items-center gap-2 space-y-2">
                  {item.buyPrices.map((bp, i) => (
                    <div key={i} className="contents">
                      <span>{formatCurrency(bp.price)}</span>
                      <Badge variant="secondary">{bp.stock} left</Badge>
                    </div>
                  ))}
                </TableCell>
                {priceGroups.map((pg, i) => {
                  const price = item.sellPrices.find(
                    (p) => p.priceGroup.id === pg.id
                  )?.price

                  return (
                    <TableCell key={i}>{formatCurrency(price ?? 0)}</TableCell>
                  )
                })}
              </TableRow>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] w-[92vw] overflow-auto pt-0 sm:max-w-[92vw]">
              <DialogHeader>
                <DialogTitle className="mt-4">Update item</DialogTitle>
              </DialogHeader>

              <ItemForm item={item} />
            </DialogContent>
          </Dialog>
        ))}
      </TableBody>
    </Table>
  )
}
