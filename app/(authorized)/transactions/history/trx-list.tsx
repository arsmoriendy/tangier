"use client"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTrx } from "./trx-ctx"
import { TrxDialog } from "./trx-dialog"

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
        {getTrx.map((trx, i) => (
          <TrxDialog key={i} trx={trx} />
        ))}
      </TableBody>
    </Table>
  )
}
