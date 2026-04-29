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
          <TableRow key={i}>
            <TableCell>{pg.name}</TableCell>
            <TableCell>{pg.quantityThreshold}</TableCell>
            <TableCell>{pg.hexColor}</TableCell>
            <TableCell>{pg.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
