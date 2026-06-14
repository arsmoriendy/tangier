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
import { useTranslations } from "next-intl"

export function TrxList() {
  const t = useTranslations("transactions.history")
  const tc = useTranslations("common")
  const { getTrx } = useTrx()
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{tc("id")}</TableHead>
          <TableHead>{tc("items")}</TableHead>
          <TableHead>{tc("totalPrice")}</TableHead>
          <TableHead>{t("table.date")}</TableHead>
          <TableHead>{t("table.time")}</TableHead>
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
