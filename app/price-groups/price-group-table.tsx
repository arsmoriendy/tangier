"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { priceGroups } from "@/lib/db/schema"

function PriceGroupRow({
  priceGroup,
}: {
  priceGroup: typeof priceGroups.$inferSelect
}) {
  return (
    <TableRow>
      <TableCell>{priceGroup.name}</TableCell>
      <TableCell>{priceGroup.quantityThreshold}</TableCell>
      <TableCell>{priceGroup.hexColor}</TableCell>
      <TableCell>{priceGroup.description}</TableCell>
    </TableRow>
  )
}

export default function PriceGroupTable(props: {
  priceGroups: (typeof priceGroups.$inferSelect)[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Min qty</TableHead>
          <TableHead>Color</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.priceGroups.map((pg, i) => (
          <PriceGroupRow key={i} priceGroup={pg} />
        ))}
      </TableBody>
    </Table>
  )
}
