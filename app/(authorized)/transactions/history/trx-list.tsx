"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTrx } from "./trx-ctx"
import { formatCurrency } from "@/lib/i18n/currency"

export function TrxList() {
  const { getTrx } = useTrx()
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Id</TableHead>
          <TableHead>Total price</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {getTrx.map((trx, i) => {
          const createdDate = new Date(trx.createdAt)
          return (
            <TableRow key={i}>
              <TableCell>{trx.id}</TableCell>
              <TableCell>{formatCurrency(trx.totalPrice)}</TableCell>
              <TableCell>{createdDate.toLocaleDateString()}</TableCell>
              <TableCell>{createdDate.toLocaleTimeString()}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
